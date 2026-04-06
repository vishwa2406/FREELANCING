import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { courseAPI } from '../../services/api'
import { useApi } from '../../hooks/useApi'
import Spinner from '../ui/Spinner'
import Badge from '../ui/Badge'

export default function CourseSuggestions() {
  const { data, loading } = useApi(courseAPI.list, [], { defaultData: { courses: [] } })
  
  // Custom logic to "curate" courses: pick 3 high-rated or diverse courses
  const curatedCourses = data?.courses
    ?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    ?.slice(0, 3) || []

  if (loading) return (
    <div className="bg-surface-900/50 border border-surface-700/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
      <Spinner size="lg" color="brand" />
      <p className="text-surface-400 text-sm mt-4 animate-pulse">Curating your personalized learning path...</p>
    </div>
  )

  if (curatedCourses.length === 0) return null

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">AI Recommendations</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Handpicked for Your Side</h2>
          <p className="text-surface-400 text-sm mt-1">Boost your skills with these high-impact courses selected just for you.</p>
        </div>
        <Link to="/courses" className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-all flex items-center gap-1 group">
          Explore all courses
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {curatedCourses.map((course, idx) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={`/courses/${course._id}`} className="block group">
              <div className="bg-surface-900 border border-surface-700/50 rounded-2xl overflow-hidden hover:border-brand-500/30 transition-all flex flex-col h-full shadow-lg hover:shadow-brand-500/5">
                {/* Thumbnail Area */}
                <div className="aspect-video relative overflow-hidden bg-surface-800">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={course.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-600">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge variant={course.level}>{course.level}</Badge>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-surface-500 uppercase tracking-tighter shrink-0">{course.category || 'Professional'}</span>
                    <div className="h-px bg-surface-700/50 flex-1" />
                    <div className="flex items-center gap-1 text-warning-400">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-xs font-bold">{course.rating || '5.0'}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-white leading-tight mb-3 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center text-[10px] font-bold text-surface-400">
                        {course.instructor?.[0] || 'I'}
                      </div>
                      <span className="text-xs text-surface-400 truncate max-w-[100px]">{course.instructor}</span>
                    </div>
                    <span className="text-xs font-semibold text-brand-400">{course.estimatedHours}h Total</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
