import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import { fetchQuiz, getQuizAttempts, getUser } from '../lib/api.js'

export default function QuizResult() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ name: 'Student' })
  const { state } = useLocation()
  const [attempt, setAttempt] = useState(null)

  useEffect(() => {
    getUser().then(setUser).catch(() => {})
    fetchQuiz(id).then(data => {
        // Normalize DB quiz data to match typical frontend structure (flatten options, find correct index)
        let normalized = { ...data }
        if (data.questions && data.questions.length > 0 && typeof data.questions[0].options[0] === 'object') {
             normalized.questions = data.questions.map(q => ({
                 id: q.id,
                 prompt: q.prompt,
                 type: q.type,
                 options: q.options.map(o => o.content),
                 correctIndex: q.options.findIndex(o => o.is_correct),
                 explanation: q.explanation 
             }))
        }
        
        // Handle snake_case property for legacy frontend support
        if (normalized.passing_score_percent !== undefined) {
             normalized.passingScorePercent = normalized.passing_score_percent
        }
        
        setQuiz(normalized)
    }).catch(() => setQuiz(null)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!quiz) return
    // Prepare attempt object from location state or API
    if (state?.percent != null) {
      // Came from QuizTake submission
      const newAttempt = {
        quizId: id,
        percent: state.percent,
        correct: state.correct ?? state.correctCount,
        total: state.total ?? quiz.questions.length,
        passed: state.passed,
        answers: state.answers,
        userId: user.id || 0,
        userName: user.name,
        timestamp: Date.now()
      }
      setAttempt(newAttempt)
    } else {
      // Refresh or regular navigation - fetch from API
      getQuizAttempts(id).then(attempts => {
          if (attempts && attempts.length > 0) {
              setAttempt(attempts[0]) // Most recent
          }
      }).catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, quiz]) // Depend on quiz so this runs when quiz loads

  const percent = attempt?.percent ?? 0
  const correct = attempt?.correct ?? 0
  const total = attempt?.total ?? quiz?.questions?.length ?? 0
  const passed = attempt?.passed ?? false
  const answers = attempt?.answers ?? {}
  const attemptDate = useMemo(() => attempt ? new Date(attempt.timestamp).toLocaleString() : null, [attempt])

  if (loading) return <AppLayout><div className="p-10 text-center">Loading...</div></AppLayout>

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Results: {quiz.title}</h1>
          <p className={`mt-2 text-lg font-medium ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>{passed ? 'Passed' : 'Did not pass'}</p>
          <div className="mt-2 text-sm text-slate-600">{attemptDate && `Taken: ${attemptDate}`}</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
              <div className="text-slate-600">Score</div>
              <div className="text-2xl font-semibold text-primary-700">{percent}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-600">Correct</div>
              <div className="text-2xl font-semibold">{correct}/{total}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-600">Passing Threshold</div>
              <div className="text-2xl font-semibold">{quiz.passingScorePercent}%</div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link to={`/quizzes/${quiz.id}/take`} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Retake</Link>
            <Link to={`/courses/ai-foundations`} className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Back to Course</Link>
          </div>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold">Review</h2>
          <div className="mt-4 space-y-4">
            {quiz.questions.map((q, idx) => {
              const userIndex = answers?.[q.id]
              const isCorrect = userIndex === q.correctIndex
              return (
                <div key={q.id} className="p-4 rounded-xl border" style={{ borderColor: isCorrect ? 'rgba(5, 150, 105, 0.4)' : 'rgba(244, 63, 94, 0.4)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Question {idx + 1}</h3>
                    <span className={`text-sm ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </div>
                  <p className="mt-2 text-slate-700">{q.prompt}</p>
                  <div className="mt-2 text-sm text-slate-600">Your answer: {userIndex != null ? String.fromCharCode(65 + userIndex) : '—'}</div>
                  <div className="text-sm text-slate-600">Correct answer: {String.fromCharCode(65 + q.correctIndex)}</div>
                  {q.explanation && <p className="mt-2 text-slate-600">{q.explanation}</p>}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
