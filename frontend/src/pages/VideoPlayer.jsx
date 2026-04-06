import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { courseAPI, progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

export default function VideoPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const { data, loading } = useApi(() => courseAPI.get(id), [id])
  const lessons = data?.lessons || []
  const course = data?.course

  const playableLessons = useMemo(() => {
    if (lessons.length > 0) return lessons

    if (course?.videoUrl) {
      return [
        {
          _id: 'course-video',
          title: course.title || 'Course Video',
          description: course.description || '',
          videoUrl: course.videoUrl,
          duration: course.estimatedHours ? course.estimatedHours * 60 : 0,
        },
      ]
    }

    return []
  }, [lessons, course])

  const [activeIdx, setActiveIdx] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const videoRef = useRef(null)

  const activeLesson = playableLessons[activeIdx]
  const videoUrl = activeLesson?.videoUrl
  const isCourseLevelVideo = activeLesson?._id === 'course-video'
  const currentCompleteKey = isCourseLevelVideo ? 'course-complete' : activeLesson?._id

  const isYouTubeVideo =
    typeof videoUrl === 'string' &&
    (videoUrl.includes('youtube.com/embed/') ||
      videoUrl.includes('youtube.com/watch?v=') ||
      videoUrl.includes('youtu.be/'))

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ''

    if (url.includes('youtube.com/embed/')) return url

    if (url.includes('youtube.com/watch?v=')) {
      const youtubeId = url.split('v=')[1]?.split('&')[0]
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : ''
    }

    if (url.includes('youtu.be/')) {
      const youtubeId = url.split('youtu.be/')[1]?.split('?')[0]
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : ''
    }

    return url
  }

  const embedUrl = isYouTubeVideo ? getYouTubeEmbedUrl(videoUrl) : videoUrl

  useEffect(() => {
    const lessonParam = Number(searchParams.get('lesson') || 0)
    if (!Number.isNaN(lessonParam) && lessonParam >= 0 && lessonParam < playableLessons.length) {
      setActiveIdx(lessonParam)
    }
  }, [searchParams, playableLessons.length])

  useEffect(() => {
    if (!id) return

    const markStarted = async () => {
      try {
        await progressAPI.start({ courseId: id })
      } catch (_) {}
    }

    markStarted()
  }, [id])

  useEffect(() => {
    let ignore = false

    const loadExistingProgress = async () => {
      try {
        const { data: progressRes } = await progressAPI.me(id)
        const progressItem = Array.isArray(progressRes?.progress)
          ? progressRes.progress[0]
          : null

        if (!progressItem || ignore) return

        const completedSet = new Set(
          (progressItem.completedLessons || []).map((lesson) =>
            typeof lesson === 'string' ? lesson : lesson?._id
          ).filter(Boolean)
        )

        if (
          progressItem.isCompleted &&
          ((lessons && lessons.length === 0) || course?.videoUrl)
        ) {
          completedSet.add('course-complete')
        }

        setCompleted(completedSet)
      } catch {
        // ignore
      }
    }

    if (id) {
      loadExistingProgress()
    }

    return () => {
      ignore = true
    }
  }, [id, lessons, course])

  const markComplete = useCallback(async (lessonId) => {
    const isCourseLevel = !lessonId || lessonId === 'course-video'
    const completeKey = isCourseLevel ? 'course-complete' : lessonId

    if (completed.has(completeKey)) return

    try {
      await progressAPI.complete({
        courseId: id,
        lessonId: isCourseLevel ? null : lessonId,
        isCourseLevel
      })

      setCompleted(prev => {
        const next = new Set(prev)
        next.add(completeKey)
        return next
      })

      toast(
        isCourseLevel ? 'Course completed! ✓' : 'Lesson completed! ✓',
        'success'
      )
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to mark complete', 'error')
    }
  }, [id, completed, toast])

  const handleEnded = () => {
    if (activeLesson?._id) {
      markComplete(activeLesson._id)
    }

    if (activeIdx < playableLessons.length - 1) {
      setTimeout(() => setActiveIdx(i => i + 1), 800)
    }
  }

  useEffect(() => {
    if (!isYouTubeVideo && videoRef.current) {
      videoRef.current.load()
    }
  }, [activeIdx, isYouTubeVideo])

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!playableLessons.length) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-surface-400">No video available for this course.</p>
        <Button variant="secondary" onClick={() => navigate(`/courses/${id}`)}>← Back to Course</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${id}`)}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
        >
          {course?.title || 'Back'}
        </Button>
      </div>

      <div className={`flex gap-4 transition-all duration-300 ${sidebarOpen ? 'lg:flex-row' : ''} flex-col`}>
        <div className="flex-1 min-w-0">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group">
            {videoUrl ? (
              isYouTubeVideo ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={activeLesson?.title || 'Course Video'}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  onEnded={handleEnded}
                  className="w-full h-full"
                  key={videoUrl}
                >
                  <source src={videoUrl} />
                  Your browser doesn't support video.
                </video>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <svg className="w-16 h-16 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.876v6.248a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-surface-500 text-sm">No video URL available</p>
              </div>
            )}
          </div>

          <div className="mt-4 glass-dark rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-surface-500 mb-1">Video {activeIdx + 1} of {playableLessons.length}</p>
                <h2 className="font-semibold text-white">{activeLesson?.title}</h2>
                {activeLesson?.description && (
                  <p className="text-sm text-surface-400 mt-1">{activeLesson.description}</p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                {!completed.has(currentCompleteKey) && (
                  <Button variant="success" size="sm" onClick={() => markComplete(activeLesson?._id)}>
                    Mark Complete
                  </Button>
                )}

                {completed.has(currentCompleteKey) && (
                  <span className="text-sm text-success-400 font-medium">✓ Completed</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeIdx === 0}
              onClick={() => {
                const nextIndex = activeIdx - 1
                setActiveIdx(nextIndex)
                navigate(`/courses/${id}/watch?lesson=${nextIndex}`)
              }}
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
            >
              Previous
            </Button>

            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="text-xs text-surface-400 hover:text-white transition-colors hidden lg:block"
            >
              {sidebarOpen ? '→ Hide playlist' : '← Show playlist'}
            </button>

            <Button
              variant="secondary"
              size="sm"
              disabled={activeIdx === playableLessons.length - 1}
              onClick={() => {
                const nextIndex = activeIdx + 1
                setActiveIdx(nextIndex)
                navigate(`/courses/${id}/watch?lesson=${nextIndex}`)
              }}
              iconRight={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            >
              Next
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: .25 }}
              className="w-full lg:w-72 shrink-0"
            >
              <div className="glass-dark rounded-2xl overflow-hidden h-full max-h-[70vh] lg:max-h-[calc(100vh-12rem)] flex flex-col">
                <div className="p-4 border-b border-surface-700/50">
                  <p className="font-semibold text-sm text-white">Course Playlist</p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {course?.title || 'Course'} videos
                  </p>
                </div>

                <div className="overflow-y-auto flex-1">
                  {playableLessons.map((lesson, i) => {
                    const isActive = i === activeIdx
                    const itemKey = lesson._id === 'course-video' ? 'course-complete' : lesson._id
                    const isDone = completed.has(itemKey)

                    return (
                      <button
                        key={lesson._id || i}
                        onClick={() => {
                          setActiveIdx(i)
                          navigate(`/courses/${id}/watch?lesson=${i}`)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-surface-800 last:border-0 transition-all ${
                          isActive ? 'bg-brand-500/10 border-l-2 border-l-brand-500' : 'hover:bg-surface-800/60'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                          isActive
                            ? 'bg-brand-500 text-white'
                            : isDone
                            ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                            : 'bg-surface-700 text-surface-400'
                        }`}>
                          {isDone && !isActive ? '✓' : isActive
                            ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            : i + 1
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${
                            isActive ? 'text-brand-300' : isDone ? 'text-surface-400' : 'text-surface-300'
                          }`}>
                            {lesson.title}
                          </p>
                          {lesson.duration ? (
                            <p className="text-[10px] text-surface-600 mt-0.5">{lesson.duration} min</p>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}