import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const statusColors = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  accepted: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
}

export default function FreelancerProposals() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast: showToast } = useToast()

  useEffect(() => {
    freelancerAPI.getMyProposals()
      .then(({ data }) => setProposals(data.proposals))
      .catch(() => showToast('Failed to load proposals', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Proposals</h1>
        <p className="text-surface-400 text-sm mt-1">Track all proposals you've sent to clients.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No proposals sent yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(item => (
            <div key={`${item.projectId}-${item.proposal?._id}`} className="bg-surface-900 border border-surface-700/50 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">{item.projectTitle}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.proposal?.status] || statusColors.pending}`}>
                      {item.proposal?.status}
                    </span>
                  </div>
                  <p className="text-surface-500 text-xs mt-0.5">Client: {item.client?.name}</p>
                  <p className="text-surface-400 text-sm mt-2 line-clamp-2">{item.proposal?.coverLetter}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-green-400 font-bold">${item.proposal?.bidAmount}</p>
                  <p className="text-surface-500 text-xs">{item.proposal?.deliveryDays} days</p>
                </div>
              </div>
              {item.proposal?.status === 'accepted' && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Accepted! This project is now in your active orders.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
