import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import { courseAPI, lessonAPI, quizAPI, progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: courseRes, loading: courseLoading } = useApi(() => courseAPI.get(id), [id])
  const { data: lessonRes, loading: lessonLoading } = useApi(() => lessonAPI.list(id), [id])
  const { data: quizRes } = useApi(() => quizAPI.byCourse(id), [id])

  const course = courseRes?.course
  const lessons = lessonRes?.lessons || []
  const quizzes = quizRes?.quizzes || []

  const [certificate, setCertificate] = useState(null)

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const { data } = await progressAPI.certificate(id)
        setCertificate(data.certificate)
      } catch {
        setCertificate(null)
      }
    }

    if (id) {
      loadCertificate()
    }
  }, [id])

  const handleStartCourse = async () => {
    try {
      await progressAPI.start({ courseId: id })
    } catch (_) {
      // ignore and still navigate
    }
    navigate(`/courses/${id}/watch?lesson=0`)
  }

  const handleDownloadCertificate = () => {
    if (!certificate) return

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Background
    doc.setFillColor(248, 249, 251)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Outer border
    doc.setDrawColor(20, 28, 45)
    doc.setLineWidth(1.5)
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16)

    // Inner border
    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(0.8)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)

    // Decorative left bars
    doc.setFillColor(212, 175, 55)
    doc.rect(16, 12, 2, pageHeight - 24, 'F')
    doc.rect(21, 12, 1.4, pageHeight - 24, 'F')
    doc.rect(25, 12, 1.4, pageHeight - 24, 'F')

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 28, 45)
    doc.setFontSize(28)
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 32, { align: 'center' })

    // Project title
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(90, 98, 115)
    doc.setFontSize(14)
    doc.text('CEGP - Community Empowerment & Growth Portal', pageWidth / 2, 42, { align: 'center' })

    // Presented to
    doc.setFontSize(13)
    doc.setTextColor(100, 100, 100)
    doc.text('This certificate is proudly presented to', pageWidth / 2, 60, { align: 'center' })

    // User name
    doc.setFont('times', 'bold')
    doc.setTextColor(10, 15, 25)
    doc.setFontSize(30)
    doc.text(certificate.userName || 'Student', pageWidth / 2, 78, { align: 'center' })

    // Main description
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 70, 70)
    doc.setFontSize(13)

    const bodyLines = [
      'for successfully completing the course',
      `"${certificate.courseTitle}"`,
      `with a quiz score of ${certificate.quizPercentage}%`,
      `under the project "${certificate.projectTitle}".`
    ]

    let y = 94
    bodyLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' })
      y += 9
    })

    // Completion date box
    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(0.5)
    doc.roundedRect(pageWidth / 2 - 34, 128, 68, 18, 2, 2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 28, 45)
    doc.setFontSize(11)
    doc.text('Completion Date', pageWidth / 2, 135, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(
      new Date(certificate.completedAt).toDateString(),
      pageWidth / 2,
      142,
      { align: 'center' }
    )

    // Signature lines
    doc.setDrawColor(120, 120, 120)
    doc.line(45, 172, 95, 172)
    doc.line(pageWidth - 95, 172, pageWidth - 45, 172)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(12)
    doc.text('Academic Review', 70, 179, { align: 'center' })
    doc.text('Platform Verification', pageWidth - 70, 179, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(90, 90, 90)
    doc.text('CEGP Module A', 70, 186, { align: 'center' })
    doc.text('Career & Skill Development', pageWidth - 70, 186, { align: 'center' })

    // Footer note
    doc.setFontSize(9)
    doc.setTextColor(110, 110, 110)
    doc.text(
      'This certificate is digitally generated upon successful course completion and quiz qualification.',
      pageWidth / 2,
      pageHeight - 16,
      { align: 'center' }
    )

    const fileName = `${(certificate.courseTitle || 'course')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_certificate.pdf`

    doc.save(fileName)
  }

  if (courseLoading || lessonLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        description="The course you are looking for does not exist."
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1.45fr_.75fr] gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-3xl overflow-hidden glass-dark">
            <div className="aspect-[16/8] bg-surface-800 relative">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-500">
                  No Thumbnail
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge>{course.level}</Badge>
                <Badge variant="secondary">{course.category}</Badge>
                {course.isFeatured && <Badge variant="success">Featured</Badge>}
              </div>

              <h1 className="text-3xl font-bold text-white leading-tight">{course.title}</h1>
              <p className="text-surface-400 mt-3 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-surface-500 mt-5">
                <div>{course.instructor}</div>
                <div>{course.estimatedHours || 0} hours</div>
                <div>{course.enrolledCount || 0} enrollments</div>
                <div>{course.rating || 0} rating</div>
              </div>

              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {course.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs bg-surface-800 text-surface-300 border border-surface-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-6">
            <h2 className="font-semibold text-white mb-4 text-lg">Course Content</h2>

            {lessons.length === 0 ? (
              <p className="text-sm text-surface-400">
                No lessons added yet. You can still start this course if a course-level video is available.
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, i) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-surface-800 px-4 py-3 bg-surface-900/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center text-xs font-semibold shrink-0">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                          <p className="text-xs text-surface-500 truncate">
                            {lesson.duration ? `${lesson.duration} min` : 'Lesson'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {lesson.videoUrl && (
                      <button
                        onClick={async () => {
                          try {
                            await progressAPI.start({ courseId: id })
                          } catch (_) {}
                          navigate(`/courses/${id}/watch?lesson=${i}`)
                        }}
                        className="text-brand-400 hover:text-brand-300 text-xs font-medium shrink-0"
                      >
                        Open
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {quizzes.length > 0 && (
            <div className="glass-dark rounded-3xl p-6">
              <h2 className="font-semibold text-white mb-4 text-lg">Course Quiz</h2>

              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="rounded-2xl border border-surface-800 px-4 py-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-white font-medium">{quiz.title}</p>
                      <p className="text-xs text-surface-500 mt-1">
                        Passing Score: {quiz.passingScore}% • Max Attempts: {quiz.maxAttempts}
                      </p>
                    </div>

                    <Link to={`/quiz/${quiz._id}`}>
                      <Button size="sm" variant="secondary">Start Quiz</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sticky top-24"
        >
          <div className="glass-dark rounded-3xl p-6 space-y-5">
            <div>
              <p className="text-sm text-surface-500 mb-1">Ready to begin?</p>
              <h3 className="text-xl font-semibold text-white">Start learning now</h3>
            </div>

            <Button onClick={handleStartCourse} size="lg" full>
              Start Course
            </Button>

            {certificate && (
              <Button
                variant="success"
                size="lg"
                full
                onClick={handleDownloadCertificate}
              >
                Download Certificate 🎓
              </Button>
            )}

            {course.videoUrl && (
              <p className="text-xs text-surface-500">
                This course has a direct course video available.
              </p>
            )}

            {certificate && (
              <div className="rounded-2xl border border-success-500/20 bg-success-500/10 p-4">
                <p className="text-sm font-medium text-success-400">Certificate unlocked</p>
                <p className="text-xs text-surface-300 mt-1">
                  You completed the course and passed the quiz with {certificate.quizPercentage}%.
                </p>
              </div>
            )}

            {course.prerequisites?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-white mb-2">Prerequisites</p>
                <ul className="space-y-1 text-sm text-surface-400">
                  {course.prerequisites.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {course.outcomes?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-white mb-2">What you’ll learn</p>
                <ul className="space-y-1 text-sm text-surface-400">
                  {course.outcomes.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}