import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

/**
 * DashboardLayout — wraps every authenticated page.
 * Includes back/forward browser-history navigation buttons in the
 * content area header bar (above <Outlet />).
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed]     = useState(false)
  const navigate = useNavigate()

  /** Go back one step in browser history */
  const handleBack = useCallback(() => navigate(-1), [navigate])
  /** Go forward one step in browser history */
  const handleForward = useCallback(() => navigate(1), [navigate])

  return (
    <div className="relative flex h-screen bg-surface-950 overflow-hidden">
      {/* Premium Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed(v => !v)}
      />

      <div className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Back / Forward nav strip */}
        <div className="flex items-center gap-1 px-4 md:px-6 lg:px-8 pt-3 pb-0">
          <button
            onClick={handleBack}
            title="Go back"
            className="
              flex items-center justify-center w-8 h-8 rounded-lg
              bg-surface-900 border border-surface-700/50
              text-surface-400 hover:text-white hover:bg-surface-800
              transition-colors active:scale-95
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleForward}
            title="Go forward"
            className="
              flex items-center justify-center w-8 h-8 rounded-lg
              bg-surface-900 border border-surface-700/50
              text-surface-400 hover:text-white hover:bg-surface-800
              transition-colors active:scale-95
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}