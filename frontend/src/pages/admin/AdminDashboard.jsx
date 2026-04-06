import { useApi } from '../../hooks/useApi'
import { adminAPI } from '../../services/api'
import Spinner from '../../components/ui/Spinner'

export default function AdminDashboard() {
  const { data, loading } = useApi(adminAPI.analytics, [], { defaultData: { analytics: {} } })
  const analytics = data?.analytics || {}

  const cards = [
    { label: 'Total Users', value: analytics.totalUsers || 0 },
    { label: 'Total Mentors', value: analytics.totalMentors || 0 },
    { label: 'Published Courses', value: analytics.totalCourses || 0 },
    { label: 'Active Jobs', value: analytics.totalJobs || 0 },
    { label: 'Enrollments', value: analytics.totalEnrollments || 0 },
    { label: 'Pending Mentor Requests', value: analytics.pendingMentorRequests || 0 },
  ]

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-surface-400 text-sm mt-1">Manage platform content, users and mentorship flow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map(card => (
          <div key={card.label} className="glass-dark rounded-2xl p-5">
            <p className="text-surface-400 text-sm">{card.label}</p>
            <h2 className="text-3xl font-bold text-white mt-2">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-dark rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {(analytics.recentUsers || []).map(user => (
              <div key={user._id} className="flex items-center justify-between border-b border-surface-800 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-surface-100 text-sm font-medium">{user.name}</p>
                  <p className="text-surface-500 text-xs">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-surface-300 capitalize">{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Recent Mentor Requests</h3>
          <div className="space-y-3">
            {(analytics.recentMentorRequests || []).map(item => (
              <div key={item._id} className="border-b border-surface-800 pb-3 last:border-0 last:pb-0">
                <p className="text-surface-100 text-sm">
                  <span className="font-medium">{item.mentee?.name}</span> → <span className="font-medium">{item.mentor?.name}</span>
                </p>
                <p className="text-surface-500 text-xs mt-1">{item.message || 'No message added'}</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-lg bg-surface-800 text-surface-300 capitalize">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}