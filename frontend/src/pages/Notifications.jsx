import { useEffect, useState } from 'react'
import { notificationAPI } from '../services/api'
import Spinner from '../components/ui/Spinner'

export default function Notifications() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await notificationAPI.list()
    setData(res.data.notifications)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const markRead = async (id) => {
    await notificationAPI.read(id)
    setData(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    )
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-white">Notifications</h1>

      {data.map(n => (
        <div
          key={n._id}
          onClick={() => markRead(n._id)}
          className={`p-5 rounded-2xl border transition cursor-pointer
          ${n.isRead ? 'bg-surface-900 border-surface-800' : 'bg-cyan-500/5 border-cyan-400/20'}
          hover:border-cyan-400/40`}
        >
          <div className="flex justify-between">
            <h2 className="text-white font-semibold">{n.title}</h2>
            <span className="text-xs text-surface-400">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-surface-400 mt-2">{n.message}</p>
        </div>
      ))}
    </div>
  )
}