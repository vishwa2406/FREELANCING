import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Home() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleModuleClick = (moduleId) => {
    if (!user) {
      toast('Please login to access modules', 'error')
      navigate('/login')
      return
    }

    if (moduleId === 'A') {
      navigate('/dashboard')
    } else if (moduleId === 'B') {
      navigate('/finance/dashboard')
    } else if (moduleId === 'C') {
      if (user.role === 'freelancer') {
        navigate('/freelancer/dashboard')
      } else if (user.role === 'client') {
        navigate('/freelancer/client-dashboard')
      } else {
        navigate('/role-select')
      }
    }
  }

  const primaryModules = [
    {
      id: 'A',
      title: 'Career & Skill Development',
      description: 'Build skills through courses, quizzes, progress tracking, mentors, and job opportunities.',
      cta: 'Explore Career',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3 10.12l2 .857V15a1 1 0 001 1h8a1 1 0 001-1v-4.023l2-.857V15a3 3 0 01-3 3H6a3 3 0 01-3-3v-4.88z" /></svg>
      )
    },
    {
      id: 'B',
      title: 'Financial Literacy & Personal Budgeting',
      description: 'Track transactions, manage budgets, set saving goals, and view financial reports.',
      cta: 'Finance Overview',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 3a1 1 0 10-2 0v.126a3.001 3.001 0 00-1 5.748V12a1 1 0 102 0v-.126a3.001 3.001 0 001-5.748V5zm-1 2a1 1 0 110 2 1 1 0 010-2zm0 6a1 1 0 110-2 1 1 0 010 2z" /></svg>
      )
    },
    {
      id: 'C',
      title: 'Micro-Enterprise & Freelance Launcher',
      description: 'Create offerings, capture leads, manage orders, and generate invoices for freelance work.',
      cta: 'Freelance Overview',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v6a2 2 0 002 2h2.586L8 15.414A2 2 0 009.414 16H14a2 2 0 002-2v-1h1a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 100 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h5a1 1 0 100-2H6z" /></svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.08),transparent_26%),linear-gradient(to_bottom_right,#020617,#020617)]" />

      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-surface-950/70 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3 10.12l2 .857V15a1 1 0 001 1h8a1 1 0 001-1v-4.023l2-.857V15a3 3 0 01-3 3H6a3 3 0 01-3-3v-4.88z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-base">Dashboard Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!user && !loading && (
                <>
                  <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                  <Link to="/register"><Button size="sm">Register</Button></Link>
                </>
              )}
              {user && (
                <Button size="sm" onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'finance_admin' ? '/finance-admin/dashboard' : user.role === 'mentor' ? '/mentor/dashboard' : '/dashboard')}>
                  My Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16">
        
        {/* Welcome & Overview Stats */}
        <section>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to the Hub</h1>
            <p className="text-surface-400 mt-2">Your central command for career, finance, and freelance management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-brand-400"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></div>
              <p className="text-surface-400 text-sm font-medium mb-1">Active Projects</p>
              <h3 className="text-3xl font-bold text-white">0</h3>
              <p className="text-xs text-brand-400 mt-2 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> Ready to start</p>
            </div>
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-green-400"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v6a2 2 0 002 2h2.586L8 15.414A2 2 0 009.414 16H14a2 2 0 002-2v-1h1a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 100 2h8a1 1 0 100-2H6zm0 4a1 1 0 100 2h5a1 1 0 100-2H6z" /></svg></div>
              <p className="text-surface-400 text-sm font-medium mb-1">Total Earnings</p>
              <h3 className="text-3xl font-bold text-white">$0.00</h3>
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> View finance reports</p>
            </div>
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-400"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg></div>
              <p className="text-surface-400 text-sm font-medium mb-1">Recent Activity</p>
              <h3 className="text-3xl font-bold text-white">0</h3>
              <p className="text-xs text-purple-400 mt-2 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> No recent actions</p>
            </div>
          </div>
        </section>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/freelancer/projects/post')} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-sm font-medium">Post Project</span>
              </button>
              <button onClick={() => navigate('/courses')} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <span className="text-sm font-medium">Browse Courses</span>
              </button>
              <button onClick={() => navigate('/finance/transactions')} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-sm font-medium">Add Transaction</span>
              </button>
              <button onClick={() => navigate('/freelancer')} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-sm font-medium">Freelancer Hub</span>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <button className="text-sm text-brand-400 hover:text-brand-300">View all</button>
            </div>
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 h-[220px] flex items-center justify-center text-surface-500">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm">No recent activity found.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Modules Section */}
        <section className="pt-8 border-t border-white/5 space-y-6">
          <h2 className="text-xl font-semibold text-white">Platform Modules</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {primaryModules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-surface-900 border border-surface-700/50 hover:border-brand-500/50 rounded-2xl p-6 flex flex-col transition-colors group cursor-pointer"
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
                <p className="text-surface-400 text-sm flex-1 leading-relaxed">{module.description}</p>
                <div className="mt-6 flex items-center text-brand-400 text-sm font-semibold group-hover:px-1 transition-all">
                  {module.cta}
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
