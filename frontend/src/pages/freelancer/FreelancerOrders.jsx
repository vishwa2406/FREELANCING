import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const statusColors = {
  active: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-brand-500/15 text-brand-400',
  completed: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

export default function FreelancerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast: showToast } = useToast()


  const load = () => {
    setLoading(true)
    freelancerAPI.getFreelancerOrders()
      .then(({ data }) => {
        setOrders(data.orders)
      })
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  /* ── Mark as Completed ── */
  const handleMarkCompleted = async (orderId) => {
    try {
      await freelancerAPI.markOrderCompleted(orderId)
      showToast('Order marked as delivered!', 'success')
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update order', 'error')
    }
  }

  const handleCopyID = (id) => {
    navigator.clipboard.writeText(id)
    showToast('Order ID copied to clipboard', 'success')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const getOrderName = (order) => {
    if (order.project?.title) return order.project.title
    if (order.service?.title) return order.service.title
    return 'Standard Order'
  }

  const getOrderType = (order) => {
    if (order.project) return 'Project'
    if (order.service) return 'Service Hire'
    return 'Direct'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-surface-400 text-sm mt-1">Manage your active work and deliveries.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No orders yet. Send proposals to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const orderName = getOrderName(order)
            const orderType = getOrderType(order)
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', month: 'short', day: 'numeric' 
            })

            return (
              <div key={order._id} className="bg-surface-900 border border-surface-700/50 rounded-2xl p-5 hover:border-surface-600/50 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-surface-800 px-2 py-0.5 rounded-lg border border-surface-700/50 group-hover:border-brand-500/30 transition-colors">
                        <p className="text-surface-400 text-[10px] font-mono tracking-wider">ID: {String(order._id).slice(-8).toUpperCase()}</p>
                        <button 
                          onClick={() => handleCopyID(order._id)}
                          className="text-surface-500 hover:text-brand-400 transition-colors"
                          title="Copy Full ID"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-brand-400 text-xs font-medium mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                        {orderType}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">
                        {orderName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-surface-400 text-sm flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {order.client?.name}
                        </p>
                        <p className="text-surface-400 text-sm flex items-center gap-1.5 border-l border-surface-800 pl-4">
                          <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {dateStr}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-surface-800/50">
                    <div className="text-right">
                      <p className="text-surface-500 text-[10px] font-bold uppercase tracking-widest">Total Amount</p>
                      <p className="text-2xl font-black text-green-400 tracking-tight">${order.amount}</p>
                    </div>

                    <div className="flex gap-2">
                      {/* Mark as Completed */}
                      {order.orderStatus === 'active' && (
                        <button
                          onClick={() => handleMarkCompleted(order._id)}
                          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Mark Delivered
                        </button>
                      )}

                      {order.orderStatus === 'delivered' && (
                        <div className="flex items-center gap-2 bg-brand-500/10 text-brand-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-brand-500/20">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Delivered
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
