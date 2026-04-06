import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function BrowseProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', deliveryDays: '' })
  const [sending, setSending] = useState(false)
  const { toast: showToast } = useToast()

  const load = (params = {}) => {
    setLoading(true)
    freelancerAPI.browseProjects(params)
      .then(({ data }) => setProjects(data.projects))
      .catch(() => showToast('Failed to load projects', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load({ search, minBudget: minBudget || undefined, maxBudget: maxBudget || undefined })
  }

  const handleSendProposal = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await freelancerAPI.sendProposal(selectedProject._id, {
        coverLetter: proposal.coverLetter,
        bidAmount: Number(proposal.bidAmount),
        deliveryDays: Number(proposal.deliveryDays)
      })
      showToast('Proposal sent!', 'success')
      setSelectedProject(null)
      setProposal({ coverLetter: '', bidAmount: '', deliveryDays: '' })
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error sending proposal', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Browse Projects</h1>
        <p className="text-surface-400 text-sm mt-1">Find projects that match your skills.</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <input
          className="flex-1 min-w-48 bg-surface-900 border border-surface-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          type="number" min="0"
          className="w-32 bg-surface-900 border border-surface-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500"
          placeholder="Min $"
          value={minBudget}
          onChange={e => setMinBudget(e.target.value)}
        />
        <input
          type="number" min="0"
          className="w-32 bg-surface-900 border border-surface-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500"
          placeholder="Max $"
          value={maxBudget}
          onChange={e => setMaxBudget(e.target.value)}
        />
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">Search</button>
        <button type="button" onClick={() => { setSearch(''); setMinBudget(''); setMaxBudget(''); load(); }} className="bg-surface-800 hover:bg-surface-700 text-surface-300 px-4 py-2.5 rounded-xl text-sm transition-colors">Clear</button>
      </form>

      {/* Proposal Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-1">Send Proposal</h3>
            <p className="text-surface-400 text-sm mb-4">For: <span className="text-white">{selectedProject.title}</span></p>
            <form onSubmit={handleSendProposal} className="space-y-3">
              <textarea
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                rows={4}
                placeholder="Cover letter – explain why you're the best fit..."
                value={proposal.coverLetter}
                onChange={e => setProposal(p => ({ ...p, coverLetter: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1"
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Your Bid ($)"
                  value={proposal.bidAmount}
                  onChange={e => setProposal(p => ({ ...p, bidAmount: e.target.value }))}
                  required />
                <input type="number" min="1"
                  className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Delivery (days)"
                  value={proposal.deliveryDays}
                  onChange={e => setProposal(p => ({ ...p, deliveryDays: e.target.value }))}
                  required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedProject(null)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-white py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={sending} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  {sending ? 'Sending...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No open projects found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(proj => (
            <div key={proj._id} className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-base">{proj.title}</h3>
                  <p className="text-surface-400 text-sm mt-1 line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Budget: <strong className="text-green-400">${proj.budget}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Deadline: {new Date(proj.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {proj.proposals.length} proposal{proj.proposals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {proj.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.skills.map(s => (
                        <span key={s} className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                      {proj.client?.name?.[0]?.toUpperCase()}
                    </div>
                    {proj.client?.name}
                  </div>
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Send Proposal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
