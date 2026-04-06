import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const { toast: showToast } = useToast()

  const load = () => {
    setLoading(true)
    freelancerAPI.getMyProjects()
      .then(({ data }) => setProjects(data.projects))
      .catch(() => showToast('Failed to load projects', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRespond = async (projectId, proposalId, action) => {
    try {
      await freelancerAPI.respondProposal(projectId, proposalId, { action })
      showToast(`Proposal ${action}.`, 'success')
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error responding to proposal', 'error')
    }
  }

  const statusColors = {
    open: 'bg-green-500/15 text-green-400',
    in_progress: 'bg-blue-500/15 text-blue-400',
    completed: 'bg-brand-500/15 text-brand-400',
    cancelled: 'bg-red-500/15 text-red-400',
  }

  const proposalColors = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    accepted: 'bg-green-500/15 text-green-400',
    rejected: 'bg-red-500/15 text-red-400',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
        <p className="text-surface-400 text-sm mt-1">View and manage your posted projects and proposals.</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500 mb-4">No projects posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(proj => (
            <div key={proj._id} className="bg-surface-900 border border-surface-700/50 rounded-2xl overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-surface-800/50 transition-colors"
                onClick={() => setExpanded(expanded === proj._id ? null : proj._id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{proj.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[proj.status]}`}>{proj.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-surface-400 text-sm mt-1 line-clamp-1">{proj.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-surface-500">
                      <span>Budget: <strong className="text-green-400">${proj.budget}</strong></span>
                      <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                      <span>{proj.proposals.length} proposal{proj.proposals.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-surface-500 shrink-0 transition-transform ${expanded === proj._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expanded === proj._id && (
                <div className="border-t border-surface-700/50 px-5 py-4">
                  <h4 className="text-sm font-semibold text-surface-300 mb-3">
                    Proposals ({proj.proposals.length})
                  </h4>
                  {proj.proposals.length === 0 ? (
                    <p className="text-surface-500 text-sm">No proposals yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {proj.proposals.map(p => (
                        <div key={p._id} className="bg-surface-800 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                                  {p.freelancer?.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-white text-sm font-medium">{p.freelancer?.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${proposalColors[p.status]}`}>{p.status}</span>
                              </div>
                              <p className="text-surface-400 text-sm mt-2 line-clamp-2">{p.coverLetter}</p>
                              <div className="flex gap-4 mt-1.5 text-xs text-surface-500">
                                <span>Bid: <strong className="text-green-400">${p.bidAmount}</strong></span>
                                <span>Delivery: {p.deliveryDays} days</span>
                              </div>
                            </div>
                            {p.status === 'pending' && proj.status === 'open' && (
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleRespond(proj._id, p._id, 'accepted')}
                                  className="bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRespond(proj._id, p._id, 'rejected')}
                                  className="bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
