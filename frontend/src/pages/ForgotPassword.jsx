import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../services/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ForgotPassword() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authAPI.forgot({ email })
      setSent(true)
      toast('Reset link sent! Check your inbox.', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send reset email', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to login
          </Link>
          <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
          <p className="text-surface-400 text-sm">Enter your email and we'll send a reset link</p>
        </div>
        {sent
          ? (
            <div className="glass-dark rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success-500/15 border border-success-500/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-semibold text-white mb-1">Email sent!</p>
              <p className="text-sm text-surface-400">Check your inbox for the reset link.</p>
            </div>
          )
          : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email address" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              <Button type="submit" full loading={loading} size="lg">Send Reset Link</Button>
            </form>
          )
        }
      </motion.div>
    </div>
  )
}