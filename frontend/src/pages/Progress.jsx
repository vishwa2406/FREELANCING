import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import ProgressBar from '../components/ui/ProgressBar'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function Progress() {
  const { data, loading } = useApi(progressAPI.me, [], { defaultData: { progress: [] } })

  const progresses = data?.progress || []

  const completedCourses = progresses.filter((p) => p.isCompleted).length
  const inProgressCourses = progresses.filter((p) => !p.isCompleted && (p.percentage || 0) > 0).length

  const overallPct =
    progresses.length > 0
      ? Math.round(
          progresses.reduce((acc, p) => acc + (p.percentage || 0), 0) / progresses.length
        )
      : 0

  const getProgressColor = (value) => {
    if (value >= 100) return 'success'
    if (value >= 60) return 'brand'
    if (value >= 30) return 'warning'
    return 'danger'
  }

  const getProgressLabel = (value, isCompleted) => {
    if (isCompleted || value >= 100) return 'Completed'
    if (value > 0) return 'In Progress'
    return 'Not Started'
  }

  const getProgressBadgeVariant = (value, isCompleted) => {
    if (isCompleted || value >= 100) return 'success'
    if (value > 0) return 'brand'
    return 'secondary'
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <p className="text-sm text-surface-400 tracking-wide">Learning Performance</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Progress Overview</h1>
        <p className="text-surface-400 text-sm md:text-base max-w-2xl">
          Track your course completion, monitor learning consistency, and continue your skill journey with a clear professional progress view.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="glass-dark rounded-2xl p-5 border border-surface-800">
          <p className="text-surface-400 text-sm mb-2">Overall Progress</p>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">{overallPct}%</h2>
            <Badge variant={getProgressBadgeVariant(overallPct, overallPct >= 100)}>
              {overallPct >= 100 ? 'Excellent' : 'Learning'}
            </Badge>
          </div>
          <ProgressBar value={overallPct} color={getProgressColor(overallPct)} size="lg" />
        </div>

        <div className="glass-dark rounded-2xl p-5 border border-surface-800">
          <p className="text-surface-400 text-sm mb-2">Completed Courses</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-white">{completedCourses}</h2>
            <Badge variant="success">Finished</Badge>
          </div>
          <p className="text-surface-500 text-sm mt-4">
            Courses successfully completed by the learner.
          </p>
        </div>

        <div className="glass-dark rounded-2xl p-5 border border-surface-800">
          <p className="text-surface-400 text-sm mb-2">Active Learning</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-white">{inProgressCourses}</h2>
            <Badge variant="brand">Running</Badge>
          </div>
          <p className="text-surface-500 text-sm mt-4">
            Courses currently being continued and improved.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-dark rounded-2xl p-5 border border-surface-800"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Overall Progress</h2>
            <p className="text-surface-400 text-sm mt-1">
              Your combined learning completion across all enrolled courses
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-brand-500/15 text-brand-300 font-semibold text-sm">
            {overallPct}%
          </div>
        </div>

        <ProgressBar
          value={overallPct}
          color={getProgressColor(overallPct)}
          size="lg"
          showLabel={false}
        />
      </motion.div>

      {progresses.length === 0 ? (
        <EmptyState
          title="No progress yet"
          description="Start a course and your learning progress will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {progresses.map((p, index) => {
            const percentage = p.percentage || 0
            const title = p.course?.title || 'Untitled Course'
            const statusLabel = getProgressLabel(percentage, p.isCompleted)
            const badgeVariant = getProgressBadgeVariant(percentage, p.isCompleted)
            const progressColor = getProgressColor(percentage)

            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-dark rounded-3xl p-6 border border-surface-800 hover:border-brand-500/30 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-white leading-snug break-words">
                      {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant={badgeVariant}>{statusLabel}</Badge>
                      {p.isCompleted && <Badge variant="success">Completed</Badge>}
                    </div>
                  </div>

                  <div className="shrink-0 px-4 py-2 rounded-2xl bg-cyan-500/15 text-cyan-300 font-bold text-base border border-cyan-500/20">
                    {percentage}%
                  </div>
                </div>

                <div className="mb-5">
                  <ProgressBar
                    value={percentage}
                    color={progressColor}
                    size="lg"
                    showLabel={false}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to={`/courses/${p.course?._id}/watch`}>
                    <Button size="md">
                      {p.isCompleted ? 'Review Course' : percentage > 0 ? 'Continue' : 'Start Now'}
                    </Button>
                  </Link>

                  <Link to={`/courses/${p.course?._id}`}>
                    <Button variant="secondary" size="md">
                      View Details
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}