import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authAPI } from '../services/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import ProgressBar from '../components/ui/ProgressBar'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [form, setForm] = useState({
    name:      user?.name || '',
    bio:       user?.bio  || '',
    goals:     user?.goals || '',
    skills:    user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    language:  user?.language || 'en',
  })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        name:      form.name,
        bio:       form.bio,
        goals:     form.goals,
        skills:    form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        language:  form.language,
      }
      const { data } = await authAPI.update(payload)
      updateUser(data.user)
      toast('Profile updated!', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-surface-400 text-sm mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar & completion */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          {user?.avatar
            ? <img src={user.avatar} className="w-16 h-16 rounded-full object-cover" alt={user.name} />
            : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl font-bold text-white">
                {initials}
              </div>
          }
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-surface-900" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-surface-400 mb-2">{user?.email}</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={user?.profileCompletion || 0} size="sm" color={user?.profileCompletion >= 80 ? 'success' : 'brand'} />
            <span className="text-xs text-surface-400 shrink-0">{user?.profileCompletion || 0}% complete</span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize border ${
            user?.role === 'admin'  ? 'bg-danger-500/15 text-danger-400 border-danger-500/30' :
            user?.role === 'mentor' ? 'bg-brand-500/15 text-brand-400 border-brand-500/30' :
            'bg-success-500/15 text-success-400 border-success-500/30'
          }`}>{user?.role || 'user'}</span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
        className="glass-dark rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-white">Personal Information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your full name" />
          <Input label="Language" value={form.language} onChange={set('language')} placeholder="en" />
        </div>

        <Textarea label="Bio" value={form.bio} onChange={set('bio')} rows={3}
          placeholder="Tell us about yourself…"
          hint="A short bio helps mentors and peers know you better." />

        <Textarea label="Goals" value={form.goals} onChange={set('goals')} rows={2}
          placeholder="What do you want to achieve?"
          hint="Be specific — e.g., 'Get a frontend dev job in 6 months'" />

        <Input label="Skills (comma-separated)" value={form.skills} onChange={set('skills')}
          placeholder="React, Node.js, UI Design…"
          hint="Add skills to get personalized job and course recommendations." />

        <Input label="Interests (comma-separated)" value={form.interests} onChange={set('interests')}
          placeholder="web development, machine learning…" />

        <Button onClick={handleSave} loading={loading} size="lg"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>
          Save Changes
        </Button>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
        className="glass-dark rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-white">Account Details</h2>
        {[
          { label: 'Email',    value: user?.email },
          { label: 'Role',     value: user?.role },
          { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
          { label: 'Active',   value: user?.isActive ? 'Yes' : 'No' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
            <span className="text-sm text-surface-400">{item.label}</span>
            <span className="text-sm font-medium text-surface-200 capitalize">{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}