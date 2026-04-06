import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { authAPI } from '../services/api'

/**
 * RoleSelect — shown right after login for users with role="user".
 * Lets them choose whether to proceed as a Client or apply as a Freelancer.
 *
 * "Join as Client"     → goes to /dashboard (main app)
 * "Join as Freelancer" → goes to /freelancer (landing + apply form)
 */
export default function RoleSelect() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const joinClient = async () => {
    setLoading(true)
    try {
      if (user?.role === 'user') {
        await authAPI.update({ role: 'client' })
        updateUser({ role: 'client' })
      }
      navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // If user already has a non-user role or is not logged in, redirect correctly
  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return }
    if (user.role === 'admin')         { navigate('/admin/dashboard', { replace: true }); return }
    if (user.role === 'finance_admin') { navigate('/finance-admin/dashboard', { replace: true }); return }
    if (user.role === 'mentor')        { navigate('/mentor/dashboard', { replace: true }); return }
    if (user.role === 'freelancer')    { navigate('/freelancer/dashboard', { replace: true }); return }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-surface-400">
            How would you like to use the platform?
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Client card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={joinClient}
            disabled={loading}
            className="flex flex-col items-start text-left bg-surface-900 border border-surface-700/50 hover:border-blue-500/50 rounded-2xl p-6 transition-colors group disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">Join as Client</h3>
            <p className="text-surface-400 text-sm leading-relaxed">
              Access courses, hire freelancers, post projects, and manage your learning journey.
            </p>
            <span className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium">
              Go to Dashboard
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </motion.button>

          {/* Freelancer card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/freelancer')}
            className="flex flex-col items-start text-left bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 rounded-2xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4 group-hover:bg-brand-500/25 transition-colors">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1.5">Join as Freelancer</h3>
            <p className="text-surface-400 text-sm leading-relaxed">
              Offer your skills, apply to projects, and build your freelancing career here.
            </p>
            <span className="mt-4 inline-flex items-center text-brand-400 text-sm font-medium">
              Apply Now
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </motion.button>
        </div>

        {/* Sub-note */}
        <p className="text-center text-surface-500 text-xs mt-8">
          You can always change your preference later from the platform settings.
        </p>
      </motion.div>
    </div>
  )
}
