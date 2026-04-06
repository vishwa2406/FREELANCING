import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { quizAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, loading } = useApi(() => quizAPI.get(id), [id])
  const quiz = data?.quiz

  const [answers, setAnswers]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult]     = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = async () => {
    if (!quiz) return
    const answersArray = quiz.questions.map((_, i) => answers[i] ?? -1)
    if (answersArray.some(a => a === -1)) {
      toast('Please answer all questions', 'warning')
      return
    }
    setSubmitting(true)
    try {
      const { data: res } = await quizAPI.submit(id, { answers: answersArray })
      setResult(res)
      setSubmitted(true)
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!quiz) return <div className="text-center py-20 text-surface-400">Quiz not found.</div>

  const questions = quiz.questions || []
  const q = questions[currentQ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-dark rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-lg text-white">{quiz.title}</h1>
          {!submitted && (
            <span className="text-sm text-surface-400">{Object.keys(answers).length}/{questions.length} answered</span>
          )}
        </div>
        {!submitted && (
          <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand-500 rounded-full"
              animate={{ width: `${questions.length ? ((currentQ + 1) / questions.length) * 100 : 0}%` }}
              transition={{ duration: .3 }} />
          </div>
        )}
      </div>

      {/* Result screen */}
      {submitted && result ? (
        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${result.passed ? 'bg-success-500/15 border-2 border-success-500/40' : 'bg-danger-500/15 border-2 border-danger-500/40'}`}>
            <span className="text-3xl">{result.passed ? '🎉' : '😔'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-surface-400 mb-5">
            You scored <span className="font-bold text-white">{result.score}/{result.totalQuestions}</span> ({result.percentage}%)
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-6">
            <div className="glass rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-surface-500 mb-0.5">Score</p>
              <p className="font-bold text-white">{result.percentage}%</p>
            </div>
            <div className="glass rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-surface-500 mb-0.5">Status</p>
              <p className={`font-bold ${result.passed ? 'text-success-400' : 'text-danger-400'}`}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
            <div className="glass rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-surface-500 mb-0.5">Attempt</p>
              <p className="font-bold text-white">#{result.attemptNumber}</p>
            </div>
          </div>

          {/* Detailed results */}
          <div className="text-left space-y-3 mb-6">
            {result.results?.map((r, i) => (
              <div key={i} className={`rounded-xl p-3 border ${r.isCorrect ? 'border-success-500/30 bg-success-500/5' : 'border-danger-500/30 bg-danger-500/5'}`}>
                <p className="text-sm text-surface-200 mb-1">{i + 1}. {r.question}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={r.isCorrect ? 'text-success-400' : 'text-danger-400'}>
                    {r.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                  {!r.isCorrect && (
                    <span className="text-surface-500">
                      (Correct: option {r.correctAnswer + 1})
                    </span>
                  )}
                </div>
                {r.explanation && <p className="text-xs text-surface-400 mt-1 italic">{r.explanation}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setResult(null) }}>
              Try Again
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Question */}
          <AnimatePresence mode="wait">
            {q && (
              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: .2 }}
                className="glass-dark rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-medium text-surface-500 bg-surface-800 px-2.5 py-1 rounded-lg">
                    Q{currentQ + 1} / {questions.length}
                  </span>
                  {answers[currentQ] !== undefined && (
                    <span className="text-xs text-success-400">✓ Answered</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-5 leading-snug">{q.question}</h3>
                <div className="space-y-2.5">
                  {q.options?.map((opt, oi) => {
                    const selected = answers[currentQ] === oi
                    return (
                      <motion.button key={oi} whileTap={{ scale: .98 }}
                        onClick={() => selectAnswer(currentQ, oi)}
                        className={[
                          'w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 font-medium',
                          selected
                            ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                            : 'border-surface-700 bg-surface-800/50 text-surface-300 hover:border-surface-500 hover:text-white hover:bg-surface-800',
                        ].join(' ')}>
                        <span className={`inline-flex w-6 h-6 rounded-full border items-center justify-center text-xs mr-3 shrink-0 ${selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-surface-600'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" disabled={currentQ === 0}
              onClick={() => setCurrentQ(i => i - 1)}>← Prev</Button>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentQ ? 'bg-brand-500 w-4' : answers[i] !== undefined ? 'bg-success-500' : 'bg-surface-700'}`} />
              ))}
            </div>
            {currentQ < questions.length - 1
              ? <Button size="sm" onClick={() => setCurrentQ(i => i + 1)}>Next →</Button>
              : (
                <Button size="sm" loading={submitting}
                  disabled={Object.keys(answers).length < questions.length}
                  onClick={handleSubmit}>
                  Submit Quiz
                </Button>
              )
            }
          </div>
        </>
      )}
    </div>
  )
}