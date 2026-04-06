import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courseAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { CourseCardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const levels = ['all', 'beginner', 'intermediate', 'advanced']
const categories = ['all', 'web', 'mobile', 'data', 'design', 'business', 'finance']

export default function Courses() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [category, setCat] = useState('all')
  const [page, setPage] = useState(1)

  const fetchFn = useCallback(
    () =>
      courseAPI.list({
        page,
        limit: 100,
        level: level !== 'all' ? level : undefined,
        category: category !== 'all' ? category : undefined,
      }),
    [level, category, page]
  )

  const { data, loading } = useApi(
    fetchFn,
    [level, category, page],
    { defaultData: { courses: [], total: 0, pages: 1 } }
  )

  const rawCourses = data?.courses || []

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return rawCourses

    const tokens = query.split(/\s+/).filter(Boolean)

    return rawCourses.filter((course) => {
      const haystack = [
        course.title || '',
        course.description || '',
        course.category || '',
        course.instructor || '',
        ...(course.tags || []),
      ]
        .join(' ')
        .toLowerCase()

      return tokens.every(token => haystack.includes(token))
    })
  }, [rawCourses, search])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-surface-400 text-sm mt-0.5">
            {filteredCourses.length} courses available
          </p>
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-4 space-y-3">
        <input
          placeholder="Search courses…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full bg-surface-800 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus-ring transition-all"
        />

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-surface-500 self-center mr-1">Level:</span>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => {
                setLevel(l)
                setPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                level === l
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-surface-500 self-center mr-1">Category:</span>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => {
                setCat(c)
                setPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                category === c
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your filters or search term."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/courses/${course._id}`}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="glass-dark rounded-2xl overflow-hidden group border border-transparent hover:border-brand-500/20 transition-all h-full flex flex-col"
                >
                  <div className="h-44 bg-gradient-to-br from-surface-800 to-surface-700 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={course.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                          <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge variant={course.level}>{course.level}</Badge>
                      {course.isFeatured && <Badge variant="brand">⭐ Featured</Badge>}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <p className="text-xs text-surface-500 mb-1">{course.category}</p>
                      <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-brand-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-surface-400 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-surface-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-surface-500">
                        <span>⏱ {course.estimatedHours}h</span>
                        {course.rating > 0 && <span className="text-warning-400">★ {course.rating}</span>}
                      </div>
                      <span className="text-xs text-surface-500">{course.enrolledCount || 0} enrolled</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {(data?.pages || 1) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </Button>
          <span className="text-sm text-surface-400 px-2">
            Page {page} of {data.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}