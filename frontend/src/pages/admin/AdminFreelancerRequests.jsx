import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const statusColors = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/15 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function AdminFreelancerRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [actioning, setActioning] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [viewingRequest, setViewingRequest] = useState(null)
  const { toast: showToast } = useToast()

  const load = (status = filter) => {
    setLoading(true)
    freelancerAPI.adminGetRequests({ status })
      .then(({ data }) => setRequests(data.requests))
      .catch(() => showToast('Failed to load requests', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  const handleAction = async (id, action, reason = '') => {
    setActioning(id)
    try {
      await freelancerAPI.adminHandleRequest(id, { action, rejectionReason: reason })
      showToast(`Request ${action}d successfully.`, 'success')
      setRejectId(null)
      setRejectReason('')
      setViewingRequest(null)
      load(filter)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error', 'error')
    } finally {
      setActioning(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Freelancer Requests</h1>
        <p className="text-surface-400 text-sm mt-1">Approve or reject freelancer applications.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-brand-500 text-white' : 'bg-surface-900 text-surface-400 hover:text-white border border-surface-700/50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* View Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl flex flex-col w-full max-w-2xl max-h-[90vh] shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-surface-800">
              <div>
                <h3 className="text-xl font-bold text-surface-50">Application Details</h3>
                <p className="text-surface-400 text-sm">Reviewing {viewingRequest.user?.name}'s request</p>
              </div>
              <button onClick={() => setViewingRequest(null)} className="text-surface-400 hover:text-white transition-colors p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-6">
                <DetailItem label="Full Name" value={viewingRequest.user?.name} />
                <DetailItem label="Email" value={viewingRequest.user?.email} />
                <DetailItem label="Experience Level" value={viewingRequest.experienceLevel} />
                <DetailItem label="Years of Experience" value={viewingRequest.yearsOfExperience} />
                <DetailItem label="Rate" value={viewingRequest.rate} />
                <DetailItem label="Availability (hrs/wk)" value={viewingRequest.availability} />
                <DetailItem label="Timezone" value={viewingRequest.timezone} />
                <DetailItem label="Portfolio" value={viewingRequest.portfolio} isLink />
              </div>
              
              <div className="space-y-4">
                <DetailItem label="Bio" value={viewingRequest.bio} isLong />
                <DetailItem label="Primary Skills" value={viewingRequest.primarySkills?.join(', ')} />
                
                <div className="pt-4 border-t border-surface-800">
                  <h4 className="text-sm font-bold text-brand-400 mb-3 uppercase tracking-wider">Screening Answers</h4>
                  <div className="space-y-4">
                    <DetailItem label="Expertise Description" value={viewingRequest.screeningAnswers?.expertise} isLong />
                    <DetailItem label="Handling Deadlines" value={viewingRequest.screeningAnswers?.deadlines} isLong />
                    <DetailItem label="Proudest Project" value={viewingRequest.screeningAnswers?.pastProject} isLong />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-6 border-t border-surface-800 flex flex-wrap gap-3">
              <button onClick={() => setViewingRequest(null)} className="flex-1 min-w-[100px] bg-surface-800 hover:bg-surface-700 text-white py-3 rounded-xl text-sm transition-colors">Close</button>
              {viewingRequest.status === 'pending' && (
                <>
                  <button onClick={() => setRejectId(viewingRequest._id)} className="flex-1 min-w-[100px] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm font-semibold transition-colors">Reject</button>
                  <button onClick={() => handleAction(viewingRequest._id, 'approve')} disabled={!!actioning} className="flex-1 min-w-[120px] bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-3">Rejection Reason</h3>
            <textarea
              className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-red-500 transition-colors"
              rows={3}
              placeholder="Optional reason..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => { setRejectId(null); setRejectReason('') }} className="flex-1 bg-surface-800 hover:bg-surface-700 text-white py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={() => handleAction(rejectId, 'reject', rejectReason)} disabled={!!actioning} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No {filter} requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="bg-surface-900 border border-surface-700/50 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold shrink-0">
                      {req.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-surface-50 font-semibold">{req.user?.name}</p>
                      <p className="text-surface-500 text-xs">{req.user?.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColors[req.status]}`}>{req.status}</span>
                  </div>
                  {req.bio && <p className="text-surface-300 text-sm mb-2 line-clamp-2">{req.bio}</p>}
                  <div className="flex items-center gap-4 mt-3">
                    <button 
                      onClick={() => setViewingRequest(req)}
                      className="text-brand-400 text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View Details
                    </button>
                    {req.rejectionReason && (
                      <p className="text-red-400 text-xs">Reason: {req.rejectionReason}</p>
                    )}
                  </div>
                  <p className="text-surface-600 text-xs mt-2">
                    Applied: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {req.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(req._id, 'approve')}
                      disabled={!!actioning}
                      className="flex items-center gap-1.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectId(req._id)}
                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
  )
}

function DetailItem({ label, value, isLink, isLong }) {
  return (
    <div className={`space-y-1 ${isLong ? 'sm:col-span-2' : ''}`}>
      <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{label}</label>
      {isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="block text-brand-400 text-sm hover:underline truncate">
          {value || 'N/A'}
        </a>
      ) : (
        <p className={`text-sm text-surface-100 ${isLong ? 'whitespace-pre-wrap leading-relaxed' : 'truncate'}`}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}
