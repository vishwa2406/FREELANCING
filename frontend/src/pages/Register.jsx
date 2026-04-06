import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/

    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'

    if (!form.password) {
      e.password = 'Password is required'
    } else if (!passwordRegex.test(form.password)) {
      e.password = 'Password must be at least 6 characters and include uppercase, lowercase, and a number'
    }

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast('Account created! Welcome to CEGP 🎉', 'success')
      navigate('/')
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-surface-400 text-sm">Join thousands of learners on CEGP</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" placeholder="John Doe" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Password" type="password" placeholder="At least 6 characters, uppercase, lowercase, number" value={form.password} onChange={set('password')} error={errors.password} />
          <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
          <Button type="submit" full loading={loading} size="lg" className="mt-2">Create Account</Button>
        </form>
        <p className="text-center text-sm text-surface-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}