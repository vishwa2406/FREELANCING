import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

/**
 * FreelancerLanding — shown when a "user" role visits /freelancer.
 *
 * Logic:
 *  1. If role = freelancer  → auto-redirect to /freelancer/dashboard  ✅
 *  2. If role = user:
 *     a. No request yet     → show selection: "Join as Client" | "Join as Freelancer"
 *     b. Request pending    → show pending status card
 *     c. Request rejected   → show both options; "Join as Freelancer" is disabled with a notice
 *     d. Request approved   → should not reach here (role is already changed), fallback card
 *  3. "Join as Client" always navigates to /freelancer/projects/post (client features)
 */
export default function FreelancerLanding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [request, setRequest] = useState(null)   // null = not loaded yet
  const [loaded, setLoaded] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [form, setForm] = useState({ bio: '', skills: '', portfolio: '' })
  const [submitting, setSubmitting] = useState(false)

  // ── Auto-redirect if already a freelancer ──────────────────────────────
  useEffect(() => {
    if (user?.role === 'freelancer') {
      navigate('/freelancer/dashboard', { replace: true })
      return
    }
    // Fetch existing request status
    freelancerAPI.getMyRequest()
      .then(({ data }) => setRequest(data.request || null))
      .catch(() => setRequest(null))
      .finally(() => setLoaded(true))
  }, [user, navigate])

  // ── Submit apply-as-freelancer form ───────────────────────────────────
  const handleApply = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean)
      await freelancerAPI.requestJoin({ bio: form.bio, skills: skillsArr, portfolio: form.portfolio })
      toast('Application submitted! Awaiting admin approval.', 'success')
      setRequest({ status: 'pending' })
      setShowJoinForm(false)
    } catch (err) {
      toast(err?.response?.data?.message || 'Error submitting request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isRejected  = request?.status === 'rejected'
  const isPending   = request?.status === 'pending'

  // ── Pending state card ─────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <StatusCard
          icon="pending"
          title="Application Under Review"
          message="Your freelancer application is being reviewed by the admin team. You'll be notified once a decision is made."
          action={
            <button
              onClick={() => navigate('/freelancer/projects/post')}
              className="mt-4 px-5 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-sm font-medium rounded-xl transition-colors border border-blue-500/20"
            >
              Continue as Client in the meantime →
            </button>
          }
        />
      </div>
    )
  }

  // ── Join form (apply as freelancer) ───────────────────────────────────
  if (showJoinForm) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <button
          onClick={() => setShowJoinForm(false)}
          className="flex items-center gap-2 text-surface-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-900 border border-surface-700/50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-1">Apply as Freelancer</h2>
          <p className="text-surface-400 text-sm mb-6">
            Your application will be reviewed by the admin team.
          </p>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">
                Professional Bio
              </label>
              <textarea
                rows={3}
                required
                placeholder="Tell us about your experience…"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">
                Skills <span className="text-surface-500">(comma separated)</span>
              </label>
              <input
                required
                placeholder="React, Node.js, Design…"
                value={form.skills}
                onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">
                Portfolio URL <span className="text-surface-500">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={form.portfolio}
                onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                : 'Submit Application'
              }
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Selection screen (no request yet, or rejected) ─────────────────────
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Freelancing Hub</h1>
        <p className="text-surface-400">
          Choose how you want to participate in the freelancing marketplace.
        </p>
      </motion.div>

      {/* Rejected notice banner */}
      <AnimatePresence>
        {isRejected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Your freelancer application was rejected.</p>
              {request?.rejectionReason && (
                <p className="mt-0.5 text-red-400/80">Reason: {request.rejectionReason}</p>
              )}
              <p className="mt-1 text-surface-400 text-xs">
                You can still join as a Client. You may not re-apply as a Freelancer at this time.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* ── Join as Client (always enabled) ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface-900 border border-surface-700/50 hover:border-blue-500/50 rounded-2xl p-6 transition-colors cursor-pointer group"
          onClick={() => navigate('/freelancer/projects/post')}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Join as Client</h3>
          <p className="text-surface-400 text-sm">
            Post projects, hire talented freelancers, and get your work done efficiently.
          </p>
          <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
            Get Started
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>

        {/* ── Join as Freelancer (disabled if rejected) ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative bg-surface-900 border rounded-2xl p-6 transition-colors ${
            isRejected
              ? 'border-surface-700/30 opacity-60 cursor-not-allowed'
              : 'border-surface-700/50 hover:border-brand-500/50 cursor-pointer group'
          }`}
          onClick={!isRejected ? () => navigate('/freelancer/become') : undefined}
        >
          {/* Disabled overlay label */}
          {isRejected && (
            <div className="absolute top-3 right-3 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium border border-red-500/30">
              Unavailable
            </div>
          )}

          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
            isRejected ? 'bg-surface-800' : 'bg-brand-500/15 group-hover:bg-brand-500/25'
          }`}>
            <svg className={`w-6 h-6 ${isRejected ? 'text-surface-600' : 'text-brand-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h3 className={`text-lg font-semibold mb-2 ${isRejected ? 'text-surface-500' : 'text-white'}`}>
            Join as Freelancer
          </h3>
          <p className="text-surface-400 text-sm">
            {isRejected
              ? 'Your freelancer request was rejected by an admin.'
              : 'Offer your skills, find projects, and earn money doing what you love.'
            }
          </p>
          {!isRejected && (
            <div className="mt-4 flex items-center text-brand-400 text-sm font-medium">
              Apply Now
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick client links — shown only if no rejection (so client has used platform) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 bg-surface-900/50 border border-surface-700/30 rounded-xl p-4"
      >
        <p className="text-surface-400 text-sm text-center mb-3">Already using the platform?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate('/freelancer/projects/mine')}
            className="text-sm text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
          >
            My Projects
          </button>
          <button
            onClick={() => navigate('/freelancer/orders')}
            className="text-sm text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate('/freelancer/messages')}
            className="text-sm text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
          >
            Messages
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Shared StatusCard component ──────────────────────────────────────── */
function StatusCard({ icon, title, message, action }) {
  const icons = {
    pending: (
      <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }
  const bgs = { pending: 'bg-yellow-500/15', success: 'bg-green-500/15' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface-900 border border-surface-700/50 rounded-2xl p-8 text-center"
    >
      <div className={`w-16 h-16 mx-auto rounded-full ${bgs[icon] || 'bg-surface-800'} flex items-center justify-center mb-4`}>
        {icons[icon]}
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-surface-400 text-sm">{message}</p>
      {action}
    </motion.div>
  )
}
