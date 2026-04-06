import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { jobAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { JobCardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

const types = ['all', 'full-time', 'part-time', 'internship', 'remote', 'freelance', 'contract']
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'company', label: 'Company' },
  { value: 'oldest', label: 'Oldest' },
]

const typeColors = {
  'full-time': 'success',
  'part-time': 'warning',
  internship: 'brand',
  contract: 'danger',
  remote: 'default',
  freelance: 'brand'
}

const formatDate = (value) => {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return date.toLocaleDateString()
}

const getDaysLeft = (deadline) => {
  if (!deadline) return null
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff
}

export default function Jobs() {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [location, setLocation] = useState('')
  const [skill, setSkill] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    setSavedIds(new Set((user?.savedJobs || []).map(String)))
  }, [user])

  const fetchJobsFn = useCallback(
    () =>
      showSavedOnly
        ? jobAPI.saved()
        : jobAPI.list({
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            location: location || undefined,
            skill: skill || undefined,
            sort,
            page
          }),
    [search, type, location, skill, sort, page, showSavedOnly]
  )

  const { data, loading } = useApi(fetchJobsFn, [fetchJobsFn], {
    defaultData: { jobs: [], total: 0, pages: 1, page: 1 }
  })

  const recommendedFetchFn = useCallback(() => jobAPI.recommended(), [])
  const { data: recommendedData } = useApi(recommendedFetchFn, [recommendedFetchFn], {
    defaultData: { jobs: [] }
  })

  const jobs = data?.jobs || []
  const recommendedJobs = recommendedData?.jobs || []

  const allSkills = useMemo(() => {
    const skillSet = new Set()
    jobs.forEach((job) => {
      ;(job.skills || []).forEach((s) => skillSet.add(s))
    })
    return Array.from(skillSet).slice(0, 10)
  }, [jobs])

  const handleSave = async (e, jobId) => {
    e?.stopPropagation?.()

    try {
      const { data } = await jobAPI.save(jobId)

      setSavedIds((prev) => {
        const next = new Set(prev)
        if (data.saved) next.add(jobId)
        else next.delete(jobId)
        return next
      })

      updateUser?.({
        savedJobs: data.savedJobs || []
      })

      toast(data.saved ? 'Job saved successfully' : 'Removed from saved jobs', 'success')

      if (showSavedOnly) {
        setSelected(null)
        fetchJobsFn()
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save job', 'error')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setType('all')
    setLocation('')
    setSkill('')
    setSort('newest')
    setPage(1)
    setShowSavedOnly(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Board</h1>
          <p className="text-surface-400 text-sm mt-1">
            Browse opportunities, filter by skills, save jobs and apply directly
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={showSavedOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setShowSavedOnly((v) => !v)
              setPage(1)
            }}
          >
            {showSavedOnly ? 'Showing Saved Jobs' : `Saved Jobs (${savedIds.size})`}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {recommendedJobs.length > 0 && !showSavedOnly && (
        <div className="glass-dark rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm">Recommended for your skills</h2>
            <span className="text-xs text-surface-500">
              Based on your profile skills
            </span>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {recommendedJobs.slice(0, 3).map((job) => (
              <button
                key={job._id}
                onClick={() => setSelected(job)}
                className="text-left rounded-xl border border-surface-700 bg-surface-900/60 p-4 hover:border-brand-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{job.title}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <Badge variant={typeColors[job.type] || 'default'}>{job.type}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass-dark rounded-2xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <input
            placeholder="Search by job title, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="bg-surface-800 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus-ring transition-all"
          />

          <input
            placeholder="Filter by location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setPage(1)
            }}
            className="bg-surface-800 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus-ring transition-all"
          />

          <input
            placeholder="Filter by skill"
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value)
              setPage(1)
            }}
            className="bg-surface-800 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-surface-50 placeholder-surface-500 focus-ring transition-all"
          />

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="bg-surface-800 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-surface-50 focus-ring transition-all"
          >
            {sortOptions.map((item) => (
              <option key={item.value} value={item.value} className="bg-surface-900">
                Sort: {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t)
                setPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                type === t
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {allSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allSkills.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSkill(chip)
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  skill === chip
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-surface-700 bg-surface-900 text-surface-400 hover:text-white hover:border-surface-500'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">
          {showSavedOnly ? `${jobs.length} saved jobs` : `${data?.total || 0} opportunities available`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title={showSavedOnly ? 'No saved jobs yet' : 'No jobs found'}
          description={
            showSavedOnly
              ? 'Save jobs from the list to access them quickly later.'
              : 'Try changing the filters, skill or location.'
          }
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const daysLeft = getDaysLeft(job.deadline)

            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelected(job)}
                className="glass-dark rounded-2xl p-5 cursor-pointer border border-transparent hover:border-brand-500/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-surface-700 to-surface-600 flex items-center justify-center text-lg font-bold text-surface-300 shrink-0">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                      job.company?.[0] || '?'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {job.company} · {job.location}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleSave(e, job._id)}
                        className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                          savedIds.has(job._id)
                            ? 'text-brand-400'
                            : 'text-surface-600 hover:text-surface-300'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={savedIds.has(job._id) ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <Badge variant={typeColors[job.type] || 'default'}>{job.type}</Badge>

                      {(job.skills || []).slice(0, 4).map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}

                      <span className="text-xs text-success-400 font-medium">
                        {job.salary || 'Not disclosed'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-surface-500">
                      <span>Posted: {formatDate(job.createdAt)}</span>
                      <span>Deadline: {formatDate(job.deadline)}</span>
                      {typeof daysLeft === 'number' && (
                        <span className={daysLeft < 0 ? 'text-danger-400' : daysLeft <= 3 ? 'text-warning-400' : ''}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} day(s) left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!showSavedOnly && (data?.pages || 1) > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-700 flex items-center justify-center text-lg font-bold text-surface-300">
                {selected.logo ? (
                  <img src={selected.logo} alt={selected.company} className="w-full h-full object-cover" />
                ) : (
                  selected.company?.[0]
                )}
              </div>

              <div>
                <p className="font-semibold text-white">{selected.company}</p>
                <p className="text-sm text-surface-400">{selected.location}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={typeColors[selected.type] || 'default'}>{selected.type}</Badge>
              <span className="text-sm text-success-400 font-medium">
                {selected.salary || 'Not disclosed'}
              </span>
              <span className="text-sm text-surface-500">
                Posted: {formatDate(selected.createdAt)}
              </span>
              <span className="text-sm text-surface-500">
                Deadline: {formatDate(selected.deadline)}
              </span>
            </div>

            {selected.description && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Job Description
                </p>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-line">
                  {selected.description}
                </p>
              </div>
            )}

            {selected.skills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Required Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.requirements?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Requirements
                </p>
                <ul className="space-y-2 text-sm text-surface-300 list-disc pl-5">
                  {selected.requirements.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={(e) => handleSave(e, selected._id)} variant={savedIds.has(selected._id) ? 'secondary' : 'primary'}>
                {savedIds.has(selected._id) ? 'Saved' : 'Save Job'}
              </Button>

              {selected.applyUrl ? (
                <a href={selected.applyUrl} target="_blank" rel="noopener noreferrer">
                  <Button>Apply Now →</Button>
                </a>
              ) : (
                <Button disabled>Apply Link Not Available</Button>
              )}

              <Button variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}