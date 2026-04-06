import { useApi } from '../../hooks/useApi'
import { mentorAPI } from '../../services/api'
import Spinner from '../../components/ui/Spinner'

export default function MentorDashboard() {
  const { data, loading } = useApi(mentorAPI.incoming, [], { defaultData: { requests: [] } })
  const requests = data?.requests || []

  const pending = requests.filter(r => r.status === 'pending').length
  const accepted = requests.filter(r => r.status === 'accepted').length
  const completed = requests.filter(r => r.status === 'completed').length

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mentor Dashboard</h1>
        <p className="text-surface-400 text-sm mt-1">Review only your mentorship requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-dark rounded-2xl p-5">
          <p className="text-surface-400 text-sm">Pending Requests</p>
          <h2 className="text-3xl font-bold text-white mt-2">{pending}</h2>
        </div>
        <div className="glass-dark rounded-2xl p-5">
          <p className="text-surface-400 text-sm">Accepted Sessions</p>
          <h2 className="text-3xl font-bold text-white mt-2">{accepted}</h2>
        </div>
        <div className="glass-dark rounded-2xl p-5">
          <p className="text-surface-400 text-sm">Completed Sessions</p>
          <h2 className="text-3xl font-bold text-white mt-2">{completed}</h2>
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Recent Requests</h3>
        <div className="space-y-3">
          {requests.slice(0, 8).map(item => (
            <div key={item._id} className="border-b border-surface-800 pb-3 last:border-0 last:pb-0">
              <p className="text-white text-sm font-medium">{item.mentee?.name}</p>
              <p className="text-surface-400 text-xs">{item.mentee?.email}</p>
              <p className="text-surface-500 text-xs mt-1">{item.message || 'No message'}</p>
              <span className="inline-block mt-2 px-2 py-1 rounded-lg bg-surface-800 text-surface-300 text-xs capitalize">
                {item.status}
              </span>
            </div>
          ))}
          {requests.length === 0 && <p className="text-surface-400 text-sm">No requests assigned to you.</p>}
        </div>
      </div>
    </div>
  )
}