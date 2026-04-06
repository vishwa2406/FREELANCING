import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function PostProject() {
  const navigate = useNavigate()
  const { toast: showToast } = useToast()
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', skills: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await freelancerAPI.createProject({
        ...form,
        budget: Number(form.budget),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      })
      showToast('Project posted successfully!', 'success')
      navigate('/freelancer/projects/mine')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error posting project', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Minimum date: today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-surface-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Post a Project</h1>
          <p className="text-surface-400 text-sm">Fill in the details to attract the best freelancers.</p>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Project Title</label>
            <input
              className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="e.g. Build a React e-commerce website"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
            <textarea
              className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
              rows={5}
              placeholder="Describe the project in detail – what you need, expectations, and any requirements..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Budget ($)</label>
              <input
                type="number" min="1"
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="500"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Deadline</label>
              <input
                type="date" min={today}
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Required Skills <span className="text-surface-500">(comma separated)</span></label>
            <input
              className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="React, Node.js, MongoDB..."
              value={form.skills}
              onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
            ) : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  )
}
