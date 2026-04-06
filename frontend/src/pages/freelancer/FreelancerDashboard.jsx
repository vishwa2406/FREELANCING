import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'

import CourseSuggestions from '../../components/dashboard/CourseSuggestions'

export default function FreelancerDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast: showToast } = useToast()
  const { conversations } = useChat()
  const { user } = useAuth()

  useEffect(() => {
    freelancerAPI.getOverview()
      .then(({ data }) => setOverview(data.overview))
      .catch(() => showToast('Failed to load overview', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const stats = [
    { label: 'Total Orders', value: overview?.totalOrders ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { label: 'Total Earnings', value: `$${overview?.totalEarnings?.toFixed(2) ?? '0.00'}`, color: 'text-green-400', bg: 'bg-green-500/10', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Active Projects', value: overview?.activeOrders ?? 0, color: 'text-brand-400', bg: 'bg-brand-500/10', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: 'Pending Proposals', value: overview?.pendingProposals ?? 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ]

  const quickLinks = [
    { label: 'Messages', path: '/messages', desc: 'Secure 1:1 chat' },
    { label: 'My Offerings', path: '/freelancer/services', desc: 'Manage your services' },
    { label: 'Browse Projects', path: '/freelancer/browse', desc: 'Find work to do' },
    { label: 'My Proposals', path: '/freelancer/proposals', desc: 'View sent proposals' },
    { label: 'My Orders', path: '/freelancer/orders/freelancer', desc: 'Active & past orders' },
  ]

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Freelancer Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-surface-900 border border-surface-700/50 rounded-2xl p-5 hover:border-brand-500/20 transition-colors">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                {stat.icon}
              </div>
              <p className="text-surface-400 text-xs font-medium mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick links */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 rounded-xl p-4 text-left transition-all group"
                  >
                    <p className="text-white font-medium group-hover:text-brand-400 transition-colors">{link.label}</p>
                    <p className="text-surface-500 text-sm mt-0.5">{link.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Courses */}
            <CourseSuggestions />
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
              <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-2 space-y-1">
                {conversations.length > 0 ? (
                  conversations.slice(0, 4).map(conv => {
                    const other = conv.participants.find(p => p._id !== user?._id);
                    return (
                      <button
                        key={conv._id}
                        onClick={() => navigate(`/messages/${conv._id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-700 overflow-hidden ring-2 ring-surface-800 shrink-0">
                          {other?.avatar ? <img src={other.avatar} alt="Img" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 font-bold">{other?.name?.charAt(0) || '?'}</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">{other?.name || 'User'}</p>
                          <p className="text-surface-500 text-xs truncate uppercase tracking-tighter mt-0.5 font-bold opacity-60">{conv.lastMessage?.content || 'No messages'}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-surface-600 text-sm italic">No recent chats</div>
                )}
                <button onClick={() => navigate('/messages')} className="w-full py-3 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors border-t border-surface-800 mt-2">
                  All Messages →
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
              <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-4 divide-y divide-surface-800">
                {overview?.recentOrders?.length > 0 ? (
                  overview.recentOrders.map(order => (
                    <div key={order._id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-bold text-white truncate hover:text-brand-400 transition-colors cursor-pointer" onClick={() => navigate('/freelancer/orders/freelancer')}>
                        {order.project?.title || order.service?.title || 'Direct Order'}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] uppercase font-bold tracking-widest">
                        <div className="flex items-center gap-1.5 text-surface-500">
                          <span className="w-1 h-1 rounded-full bg-surface-700" />
                          #{order._id.slice(-6)}
                        </div>
                        <span className={order.orderStatus === 'completed' ? 'text-green-400' : 'text-brand-400'}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-24 flex items-center justify-center text-surface-600 text-sm italic">
                    No recent orders
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
