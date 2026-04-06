import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function FreelancerEarnings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const { toast: showToast } = useToast()

  useEffect(() => {
    freelancerAPI.getEarnings()
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load earnings', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleViewInvoice = async (orderId) => {
    setDownloading(orderId)
    try {
      const res = await freelancerAPI.downloadInvoice(orderId)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Invoice unavailable', 'error')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-surface-400 text-sm mt-1">Your completed orders and revenue.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
          <p className="text-surface-400 text-sm mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-green-400">${data?.totalEarnings?.toFixed(2) ?? '0.00'}</p>
        </div>
        <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
          <p className="text-surface-400 text-sm mb-1">Completed Orders</p>
          <p className="text-3xl font-bold text-brand-400">{data?.completedOrders ?? 0}</p>
        </div>
      </div>

      {/* Orders list */}
      {data?.orders?.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No completed orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Completed Orders</h2>
          {data?.orders?.map(order => (
            <div key={order._id} className="bg-surface-900 border border-surface-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium">
                  {order.project?.title || order.service?.title || 'Direct Order'}
                </h3>
                <p className="text-surface-500 text-xs">Client: {order.client?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-green-400 font-bold">${order.amount}</p>
                <button
                  onClick={() => handleViewInvoice(order._id)}
                  disabled={downloading === order._id}
                  className="flex items-center gap-1.5 bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {downloading === order._id ? 'Opening...' : 'View Invoice'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
