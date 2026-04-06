import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function ClientFreelanceOverview() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast: showToast } = useToast()

  useEffect(() => {
    freelancerAPI.getClientOverview()
      .then(({ data }) => setOverview(data.overview))
      .catch(() => showToast('Failed to load overview', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const quickLinks = [
    {
      label: 'Post Project',
      path: '/freelancer/projects/post',
      desc: 'Create a new project and receive proposals.',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    },
    {
      label: 'My Projects',
      path: '/freelancer/projects/mine',
      desc: 'View active projects and proposals.',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      label: 'My Orders',
      path: '/freelancer/orders',
      desc: 'Track accepted orders and payments.',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    },
    {
      label: 'Browse Services',
      path: '/freelancer/services/browse',
      desc: 'Explore freelancer offerings.',
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8 border-b border-surface-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Client Overview</h1>
        <p className="text-surface-400">
          Manage your projects, review proposals, and coordinate with freelancers directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 group hover:border-brand-500/30 transition-colors">
          <p className="text-surface-400 text-sm font-medium mb-1">Active Projects</p>
          <h3 className="text-3xl font-bold text-white">{overview?.totalProjects ?? 0}</h3>
        </div>
        <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 group hover:border-brand-500/30 transition-colors">
          <p className="text-surface-400 text-sm font-medium mb-1">Pending Orders</p>
          <h3 className="text-3xl font-bold text-white">{overview?.activeOrders ?? 0}</h3>
        </div>
        <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 group hover:border-brand-500/30 transition-colors">
          <p className="text-surface-400 text-sm font-medium mb-1">Total Investment</p>
          <h3 className="text-3xl font-bold text-green-400">${overview?.totalSpent?.toFixed(2) ?? '0.00'}</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-start bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 rounded-2xl p-6 transition-all group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors text-brand-400">
                  <div className="w-5 h-5">{link.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">{link.label}</h3>
                <p className="text-surface-400 text-sm">{link.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">Recent Order Names</h2>
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-4 divide-y divide-surface-800">
            {overview?.recentOrders?.length > 0 ? (
              overview.recentOrders.map(order => (
                <div key={order._id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-bold text-white truncate">
                    {order.project?.title || order.service?.title || 'Direct Order'}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-surface-500">#{order._id.slice(-6)}</span>
                    <span className={order.orderStatus === 'completed' ? 'text-green-400' : 'text-brand-400'}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex items-center justify-center text-surface-600 text-sm">
                No orders found
              </div>
            )}
          </div>
          <button onClick={() => navigate('/freelancer/orders')} className="w-full py-3 text-xs font-bold text-surface-400 hover:text-white transition-colors">
            View All Orders →
          </button>
        </div>
      </div>
    </div>
  )
}
