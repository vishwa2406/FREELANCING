import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'finance_admin') return <Navigate to="/finance-admin/dashboard" replace />
    if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />
    if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}