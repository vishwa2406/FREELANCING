import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const { login, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.role) return

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (user.role === 'finance_admin') {
      navigate('/finance-admin/dashboard', { replace: true })
    } else if (user.role === 'mentor') {
      navigate('/mentor/dashboard', { replace: true })
    } else if (user.role === 'freelancer') {
      navigate('/freelancer/dashboard', { replace: true })
    } else {
      // role = 'user' → show role selection screen
      navigate('/role-select', { replace: true })
    }
  }, [user, navigate])

  const validate = () => {
    const e = {}

    if (!form.email.trim()) {
      e.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      e.email = 'Valid email is required'
    }

    if (!form.password) {
      e.password = 'Password is required'
    }

    setErrors(e)
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      toast(
        validationErrors.email ||
          validationErrors.password ||
          'Please fill all required fields',
        'error'
      )
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await login(form.email.trim(), form.password)
      toast('Welcome back!', 'success')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      const apiMessage = err.response?.data?.message || 'Login failed'

      if (Array.isArray(apiErrors) && apiErrors.length) {
        const mapped = {}

        apiErrors.forEach((item) => {
          if (item.field) mapped[item.field] = item.message
        })

        setErrors(mapped)

        toast(
          mapped.email ||
            mapped.password ||
            apiErrors[0]?.message ||
            apiMessage,
          'error'
        )
      } else {
        toast(apiMessage, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.12),transparent_30%),linear-gradient(to_bottom_right,#020617,#020617)] border-r border-white/5">
        <div className="max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-6 shadow-lg shadow-brand-500/25">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Empower Your Career Journey
          </h1>

          <p className="text-surface-400 text-base leading-relaxed mb-8">
            Access courses, track progress, connect with mentors, and land your dream job — all in one place.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-surface-400 text-sm">Sign in to your CEGP account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => {
                const value = e.target.value
                setForm(p => ({ ...p, email: value }))
                setErrors(prev => ({ ...prev, email: '' }))
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => {
                const value = e.target.value
                setForm(p => ({ ...p, password: value }))
                setErrors(prev => ({ ...prev, password: '' }))
              }}
              error={errors.password}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" full loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}