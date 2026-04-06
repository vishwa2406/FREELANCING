import { useEffect, useState } from 'react'
import { courseAPI, quizAPI, lessonAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Spinner from '../../components/ui/Spinner'

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
})

const emptyLesson = (order = 1) => ({
  _id: null,
  title: '',
  description: '',
  videoUrl: '',
  duration: '',
  order,
})

const initialForm = {
  title: '',
  description: '',
  thumbnail: '',
  instructor: '',
  videoUrl: '',
  level: 'beginner',
  tags: '',
  category: '',
  estimatedHours: '',
  status: 'published',
  isFeatured: false,
  prerequisites: '',
  outcomes: '',
  quizTitle: '',
  passingScore: 70,
  maxAttempts: 3,
  questions: [emptyQuestion()],
}

export default function AdminCourses() {
  const { toast } = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingQuizId, setEditingQuizId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [lessons, setLessons] = useState([emptyLesson(1)])
  const [originalLessonIds, setOriginalLessonIds] = useState([])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const { data } = await courseAPI.list({ limit: 100 })
      setCourses(data.courses || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load courses', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    setEditingQuizId(null)
    setLessons([emptyLesson(1)])
    setOriginalLessonIds([])
  }

  const normalizeCoursePayload = () => ({
    title: form.title,
    description: form.description,
    thumbnail: form.thumbnail,
    instructor: form.instructor,
    videoUrl: form.videoUrl,
    level: form.level,
    category: form.category,
    estimatedHours: Number(form.estimatedHours || 0),
    status: form.status,
    isFeatured: !!form.isFeatured,
    tags: form.tags.split(',').map(v => v.trim()).filter(Boolean),
    prerequisites: form.prerequisites.split(',').map(v => v.trim()).filter(Boolean),
    outcomes: form.outcomes.split(',').map(v => v.trim()).filter(Boolean),
  })

  const normalizeQuizPayload = () => {
    const cleanQuestions = (form.questions || [])
      .map(q => ({
        question: q.question.trim(),
        options: (q.options || []).map(opt => opt.trim()),
        correctAnswer: Number(q.correctAnswer || 0),
        explanation: q.explanation?.trim() || '',
      }))
      .filter(q => q.question && q.options.every(Boolean) && q.options.length === 4)

    if (!form.quizTitle.trim() || cleanQuestions.length === 0) {
      return null
    }

    return {
      title: form.quizTitle.trim(),
      passingScore: Number(form.passingScore || 70),
      maxAttempts: Number(form.maxAttempts || 3),
      questions: cleanQuestions,
    }
  }

  const normalizeLessonsPayload = () => {
    return lessons
      .map((lesson, index) => ({
        _id: lesson._id || null,
        title: lesson.title?.trim(),
        description: lesson.description?.trim() || '',
        videoUrl: lesson.videoUrl?.trim(),
        duration: Number(lesson.duration || 0),
        order: index + 1,
      }))
      .filter(lesson => lesson.title && lesson.videoUrl)
  }

  const updateLessonField = (index, field, value) => {
    setLessons(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addLessonRow = () => {
    setLessons(prev => [...prev, emptyLesson(prev.length + 1)])
  }

  const removeLessonRow = (index) => {
    setLessons(prev => {
      const filtered = prev.filter((_, i) => i !== index)
      if (filtered.length === 0) return [emptyLesson(1)]
      return filtered.map((lesson, i) => ({
        ...lesson,
        order: i + 1
      }))
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const coursePayload = normalizeCoursePayload()
      const quizPayload = normalizeQuizPayload()
      const lessonsPayload = normalizeLessonsPayload()

      let courseId = editingId

      if (editingId) {
        await courseAPI.update(editingId, coursePayload)
      } else {
        const { data } = await courseAPI.create(coursePayload)
        courseId = data.course?._id
      }

      if (quizPayload && courseId) {
        if (editingQuizId) {
          await quizAPI.update(editingQuizId, quizPayload)
        } else {
          await quizAPI.create(courseId, quizPayload)
        }
      }

      if (courseId) {
        if (editingId) {
          const currentIds = lessonsPayload
            .filter(lesson => lesson._id)
            .map(lesson => lesson._id)

          const idsToDelete = originalLessonIds.filter(id => !currentIds.includes(id))

          if (idsToDelete.length > 0) {
            await Promise.all(idsToDelete.map(id => lessonAPI.remove(id)))
          }

          await Promise.all(
            lessonsPayload.map((lesson, index) => {
              const payload = {
                title: lesson.title,
                description: lesson.description,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                order: index + 1,
              }

              if (lesson._id) {
                return lessonAPI.update(lesson._id, payload)
              }

              return lessonAPI.create(courseId, payload)
            })
          )
        } else {
          if (lessonsPayload.length > 0) {
            await Promise.all(
              lessonsPayload.map((lesson, index) =>
                lessonAPI.create(courseId, {
                  title: lesson.title,
                  description: lesson.description,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration,
                  order: index + 1,
                })
              )
            )
          }
        }
      }

      toast(
        editingId
          ? 'Course and lessons updated successfully'
          : 'Course created successfully',
        'success'
      )

      resetForm()
      loadCourses()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save course', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (course) => {
    setEditingId(course._id)
    setEditingQuizId(null)

    setForm({
      title: course.title || '',
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      instructor: course.instructor || '',
      videoUrl: course.videoUrl || '',
      level: course.level || 'beginner',
      tags: (course.tags || []).join(', '),
      category: course.category || '',
      estimatedHours: course.estimatedHours || '',
      status: course.status || 'published',
      isFeatured: !!course.isFeatured,
      prerequisites: (course.prerequisites || []).join(', '),
      outcomes: (course.outcomes || []).join(', '),
      quizTitle: '',
      passingScore: 70,
      maxAttempts: 3,
      questions: [emptyQuestion()],
    })

    try {
      const [quizListRes, lessonsRes] = await Promise.all([
        quizAPI.byCourse(course._id),
        lessonAPI.list(course._id),
      ])

      const quizList = quizListRes.data?.quizzes || []
      const fetchedLessons = lessonsRes.data?.lessons || []

      if (quizList.length > 0) {
        const quizId = quizList[0]._id
        const quizRes = await quizAPI.get(quizId)
        const fullQuiz = quizRes.data?.quiz

        setEditingQuizId(quizId)
        setForm(prev => ({
          ...prev,
          quizTitle: fullQuiz?.title || '',
          passingScore: fullQuiz?.passingScore || 70,
          maxAttempts: fullQuiz?.maxAttempts || 3,
          questions: fullQuiz?.questions?.length
            ? fullQuiz.questions.map(q => ({
                question: q.question || '',
                options: q.options?.length === 4 ? q.options : ['', '', '', ''],
                correctAnswer: Number(q.correctAnswer || 0),
                explanation: q.explanation || '',
              }))
            : [emptyQuestion()],
        }))
      }

      if (fetchedLessons.length > 0) {
        setLessons(
          fetchedLessons.map((lesson, index) => ({
            _id: lesson._id,
            title: lesson.title || '',
            description: lesson.description || '',
            videoUrl: lesson.videoUrl || '',
            duration: lesson.duration || '',
            order: lesson.order || index + 1,
          }))
        )
        setOriginalLessonIds(fetchedLessons.map(lesson => lesson._id))
      } else {
        setLessons([emptyLesson(1)])
        setOriginalLessonIds([])
      }
    } catch {
      setLessons([emptyLesson(1)])
      setOriginalLessonIds([])
    }
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this course?')
    if (!ok) return

    try {
      await courseAPI.remove(id)
      toast('Course deleted', 'success')
      loadCourses()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete course', 'error')
    }
  }

  const updateQuestion = (index, key, value) => {
    setForm(prev => {
      const next = [...prev.questions]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, questions: next }
    })
  }

  const updateOption = (qIndex, optIndex, value) => {
    setForm(prev => {
      const next = [...prev.questions]
      const opts = [...next[qIndex].options]
      opts[optIndex] = value
      next[qIndex] = { ...next[qIndex], options: opts }
      return { ...prev, questions: next }
    })
  }

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }))
  }

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.length === 1
        ? [emptyQuestion()]
        : prev.questions.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Courses</h1>
        <p className="text-surface-400 text-sm mt-1">
          Create, edit and delete courses with video, playlist lessons and quiz
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-5 space-y-6">
        <h2 className="text-white font-semibold">{editingId ? 'Edit Course' : 'Add New Course'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Instructor" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
          <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input label="Thumbnail URL" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
          <Input
            label="Course Video URL (Optional fallback only)"
            placeholder="Use this only if no lesson-wise videos are added"
            value={form.videoUrl}
            onChange={e => setForm({ ...form, videoUrl: e.target.value })}
          />
          <Input label="Estimated Hours" type="number" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Level</label>
            <select
              className="w-full rounded-xl bg-surface-800 border border-surface-700 text-surface-100 px-3 py-2.5"
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Status</label>
            <select
              className="w-full rounded-xl bg-surface-800 border border-surface-700 text-surface-100 px-3 py-2.5"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <Textarea label="Description" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <Input label="Prerequisites (comma separated)" value={form.prerequisites} onChange={e => setForm({ ...form, prerequisites: e.target.value })} />
        <Input label="Outcomes (comma separated)" value={form.outcomes} onChange={e => setForm({ ...form, outcomes: e.target.value })} />

        <label className="flex items-center gap-2 text-surface-300 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
          Featured course
        </label>

        <div className="border border-surface-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Lessons / Playlist</h3>
              <p className="text-surface-400 text-sm mt-1">
                Add videos lesson-wise. One video URL per lesson.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addLessonRow}>
              Add Lesson
            </Button>
          </div>

          {lessons.map((lesson, index) => (
            <div key={lesson._id || index} className="border border-surface-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Lesson {index + 1}</h4>
                {lessons.length > 1 && (
                  <Button type="button" variant="danger" onClick={() => removeLessonRow(index)}>
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Lesson Title"
                  value={lesson.title}
                  onChange={e => updateLessonField(index, 'title', e.target.value)}
                />
                <Input
                  label="Duration (min)"
                  type="number"
                  value={lesson.duration}
                  onChange={e => updateLessonField(index, 'duration', e.target.value)}
                />
              </div>

              <Input
                label="Lesson Video URL"
                placeholder="One video URL per lesson"
                value={lesson.videoUrl}
                onChange={e => updateLessonField(index, 'videoUrl', e.target.value)}
              />

              <Textarea
                label="Lesson Description"
                rows={2}
                value={lesson.description}
                onChange={e => updateLessonField(index, 'description', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="border border-surface-800 rounded-2xl p-4 space-y-4">
          <div>
            <h3 className="text-white font-semibold">Quiz for this course</h3>
            <p className="text-surface-400 text-sm mt-1">Correct answer stays hidden from user but is used for scoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Quiz Title" value={form.quizTitle} onChange={e => setForm({ ...form, quizTitle: e.target.value })} />
            <Input label="Passing Score %" type="number" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: e.target.value })} />
            <Input label="Max Attempts" type="number" value={form.maxAttempts} onChange={e => setForm({ ...form, maxAttempts: e.target.value })} />
          </div>

          <div className="space-y-4">
            {form.questions.map((q, qIndex) => (
              <div key={qIndex} className="border border-surface-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-white">Question {qIndex + 1}</h4>
                  <Button type="button" variant="danger" onClick={() => removeQuestion(qIndex)}>Remove</Button>
                </div>

                <Textarea
                  label="Question"
                  rows={2}
                  value={q.question}
                  onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => (
                    <Input
                      key={optIndex}
                      label={`Option ${optIndex + 1}`}
                      value={opt}
                      onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Correct Answer</label>
                  <select
                    className="w-full rounded-xl bg-surface-800 border border-surface-700 text-surface-100 px-3 py-2.5"
                    value={q.correctAnswer}
                    onChange={e => updateQuestion(qIndex, 'correctAnswer', Number(e.target.value))}
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>

                <Textarea
                  label="Explanation (optional)"
                  rows={2}
                  value={q.explanation}
                  onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                />
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={addQuestion}>Add Question</Button>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>
            {editingId ? 'Update Course' : 'Create Course'}
          </Button>
          {editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel Edit</Button>}
        </div>
      </form>

      <div className="glass-dark rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">All Courses</h2>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course._id} className="border border-surface-800 rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold">{course.title}</h3>
                    <p className="text-surface-400 text-sm mt-1">{course.description}</p>
                    <p className="text-surface-500 text-xs mt-2">
                      {course.instructor} • {course.category} • {course.level} • {course.status}
                    </p>
                    {course.videoUrl && (
                      <p className="text-brand-400 text-xs mt-2 break-all">Fallback Video: {course.videoUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleEdit(course)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(course._id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-surface-400 text-sm">No courses found.</p>}
          </div>
        )}
      </div>
    </div>
  )
}