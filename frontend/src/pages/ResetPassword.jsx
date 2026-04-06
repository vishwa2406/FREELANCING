import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ResetPassword() {
  const { token } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}

    if (!form.password) {
      e.password = 'Password is required'
    } else {
      if (form.password.length < 6) {
        e.password = 'Password must be at least 6 characters'
      } else if (!/[A-Z]/.test(form.password)) {
        e.password = 'Password must contain at least one uppercase letter'
      } else if (!/[a-z]/.test(form.password)) {
        e.password = 'Password must contain at least one lowercase letter'
      } else if (!/[0-9]/.test(form.password)) {
        e.password = 'Password must contain at least one number'
      }
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await authAPI.reset(token, { password: form.password })
      toast('Password reset successful. Please login.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reset password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors mb-6">
            Back to login
          </Link>
          <h2 className="text-2xl font-bold text-white mb-1">Create new password</h2>
          <p className="text-surface-400 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="Enter new password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            error={errors.password}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat new password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
          />

          <Button type="submit" full loading={loading} size="lg">
            Reset Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

