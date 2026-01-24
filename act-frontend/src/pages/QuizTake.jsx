import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import { fetchQuiz, submitQuizAttempt } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

export default function QuizTake() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchQuiz(id)
      .then(data => {
        // Normalize DB data to match frontend expectations
        // DB: data.questions = [{ id, prompt, type, options: [{id, content, is_correct}] }]
        // Mock: questions = [{ id, prompt, type, options: [strings], correctIndex }]
        
        let normalized = { ...data }
        if (data.questions && data.questions.length > 0 && typeof data.questions[0].options[0] === 'object') {
             normalized.questions = data.questions.map(q => ({
                 id: q.id,
                 prompt: q.prompt,
                 type: q.type,
                 options: q.options.map(o => o.content),
                 // We shouldn't really expose correctIndex to the frontend for security, 
                 // but for the quiz engine to work seamlessly without refactoring the whole Take component:
                 // In a real app, validation happens on backend.
                 correctIndex: q.options.findIndex(o => o.is_correct) 
             }))
        }
        
        setQuiz(normalized)
        setSecondsLeft((normalized.time_limit_minutes || normalized.timeLimitMinutes || 10) * 60)
      })
      .catch(err => {
          console.error(err)
          setQuiz(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!quiz || isSubmitting) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          if (!isSubmitting) handleSubmit() // Prevent double submit
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, isSubmitting])

  useEffect(() => {
    const handler = (e) => {
      // Warn when leaving the page if quiz not submitted
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [secondsLeft])

  if (isLoading) {
    return (
      <AppLayout>
        <Spinner />
      </AppLayout>
    )
  }

  if (isSubmitting) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner />
          <p className="text-slate-600">Submitting your quiz...</p>
        </div>
      </AppLayout>
    )
  }

  if (!quiz) {
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-xl font-semibold">Quiz not found</h1>
          <p className="mt-2 text-slate-600">The requested quiz does not exist.</p>
          <Link to="/courses/ai-foundations" className="mt-4 inline-block px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Back to Course</Link>
        </div>
      </AppLayout>
    )
  }

  const question = quiz.questions[currentIndex]

  function selectAnswer(optionIndex) {
    setAnswers({ ...answers, [question.id]: optionIndex })
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const result = await submitQuizAttempt(quiz.id, answers)
      navigate(`/quizzes/${quiz.id}/result`, {
        state: { ...result, answers }
      })
    } catch (err) {
      console.error(err)
      if (err.status === 401) {
          alert("Your session has expired. Please log in again to submit your quiz.")
          // Save progress so they don't lose it? It's already saved in localStorage via useEffect
          // We could try to open login in a new tab or redirect
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      } else {
        alert("Submission failed: " + (err.message || "Unknown error"))
      }
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{quiz.title}</h1>
            <p className="mt-1 text-slate-600">Question {currentIndex + 1} of {quiz.questions.length}</p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-primary-50 text-primary-700 border border-primary-200">
            Time Remaining: <span className="font-semibold">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLeaveConfirm(true)} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Leave Quiz</button>
          </div>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold">{question.prompt}</h2>
          <div className="mt-4 grid gap-3">
            {question.options.map((opt, i) => {
              const selected = answers[question.id] === i
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`text-left px-4 py-3 rounded-xl border transition ${selected ? 'border-primary-600 bg-primary-50' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >Previous</button>
              <button
                disabled={currentIndex === quiz.questions.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >Next</button>
            </div>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Submit Quiz</button>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold">Progress</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {quiz.questions.map((q, idx) => {
              const answered = answers[q.id] !== undefined
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl border transition ${answered ? 'border-primary-600 bg-primary-50' : 'border-slate-300'} ${isCurrent ? 'ring-2 ring-primary-400' : ''}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </section>
      </div>
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-soft border border-slate-200 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold">Leave quiz?</h3>
            <p className="mt-2 text-slate-600">Your current progress is saved. You can resume later.</p>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Continue Quiz</button>
              <Link to={`/quizzes/${id}/start`} className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Leave</Link>
              <button onClick={() => { clearProgress(id); setShowLeaveConfirm(false) }} className="px-4 py-2 rounded-xl text-rose-700 border border-rose-300 hover:bg-rose-50">Discard Saved</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
