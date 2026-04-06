import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courseAPI, jobAPI, progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import { StatCard } from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

import CourseSuggestions from '../components/dashboard/CourseSuggestions'

const stagger = { animate: { transition: { staggerChildren: .08 } } }
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const { user } = useAuth()
  const { data: coursesData, loading: cLoading } = useApi(courseAPI.list, [], { defaultData: { courses: [] } })
  const { data: jobsData, loading: jLoading } = useApi(jobAPI.list, [], { defaultData: { jobs: [] } })

  const courses  = coursesData?.courses?.slice(0, 4) || []
  const jobs     = jobsData?.jobs?.slice(0, 3) || []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="relative overflow-hidden glass-dark rounded-2xl p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(52,120,246,0.12),transparent_60%)]" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-surface-400 text-sm mb-1">{greeting()},</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-surface-400 text-sm max-w-md">
              You're on a learning streak. Keep it up! Your profile is{' '}
              <span className="text-brand-400 font-medium">{user?.profileCompletion || 0}% complete</span>.
            </p>
            {(user?.profileCompletion || 0) < 100 && (
              <div className="mt-3 max-w-xs">
                <ProgressBar value={user?.profileCompletion || 0} color="brand" size="sm" showLabel />
              </div>
            )}
          </div>
          <Link to="/courses" className="shrink-0 hidden sm:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
            Browse Courses
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Courses" value={coursesData?.total || 0} color="brand"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>}
        />
        <StatCard label="Open Jobs" value={jobsData?.total || 0} color="success"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" /></svg>}
        />
        <StatCard label="Skills" value={user?.skills?.length || 0} color="warning"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
        />
        <StatCard label="Profile %" value={`${user?.profileCompletion || 0}%`} color="danger"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
      </motion.div>

      {/* Course Suggestions Section */}
      <motion.div variants={fadeUp}>
        <CourseSuggestions />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Latest Courses</h2>
            <Link to="/courses" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
          </div>
          {cLoading
            ? <div className="flex justify-center py-8"><Spinner /></div>
            : (
              <div className="grid sm:grid-cols-2 gap-4">
                {courses.map(course => (
                  <Link key={course._id} to={`/courses/${course._id}`}>
                    <motion.div whileHover={{ y: -2 }}
                      className="glass-dark rounded-2xl overflow-hidden group border border-transparent hover:border-brand-500/20 transition-all">
                      <div className="h-36 bg-gradient-to-br from-surface-800 to-surface-700 relative overflow-hidden">
                        {course.thumbnail
                          ? <img src={course.thumbnail} className="w-full h-full object-cover" alt={course.title} />
                          : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.876v6.248a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                          )
                        }
                        <div className="absolute top-2 left-2">
                          <Badge variant={course.level}>{course.level}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-brand-300 transition-colors">{course.title}</h3>
                        <p className="text-xs text-surface-400 mb-2">{course.instructor}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-surface-500">⏱ {course.estimatedHours}h</span>
                          {course.rating > 0 && <span className="text-xs text-warning-400">★ {course.rating}</span>}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )
          }
        </motion.div>

        {/* Sidebar panel */}
        <motion.div variants={fadeUp} className="space-y-5">
          {/* Jobs snippet */}
          <div className="glass-dark rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Recent Jobs</h3>
              <Link to="/jobs" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
            </div>
            {jLoading
              ? <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              : jobs.map(job => (
                <div key={job._id} className="py-2.5 border-b border-surface-800 last:border-0">
                  <p className="text-xs font-medium text-surface-200">{job.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{job.company} · {job.location}</p>
                </div>
              ))
            }
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}