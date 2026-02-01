import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import { fetchQuiz } from '../lib/api.js'

export default function QuizStart() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuiz(id).then(setQuiz).catch(() => setQuiz(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <AppLayout><div className="p-10 text-center">Loading...</div></AppLayout>

  if (!quiz) {
    return (
      <AppLayout>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-foreground">Quiz not found</h1>
          <p className="mt-2 text-muted-foreground">The requested quiz does not exist.</p>
          <Link to="/courses/" className="mt-4 inline-block px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Back to Course</Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-foreground">{quiz.title}</h1>
          <p className="mt-1 text-muted-foreground">{quiz.description}</p>
          <div className="mt-4 flex items-center gap-6 text-foreground">
            <div>
              <span className="font-semibold">Questions:</span> {quiz.questions.length}
            </div>
            <div>
              <span className="font-semibold">Time Limit:</span> {quiz.timeLimitMinutes} minutes
            </div>
            <div>
              <span className="font-semibold">Passing Score:</span> {quiz.passingScorePercent}%
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link to={`/quizzes/${quiz.id}/take`} className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700">Start Quiz</Link>
            <Link to={`/courses/`} className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground">Back to Course</Link>
          </div>
        </header>
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold">Instructions</h2>
          <ul className="mt-3 list-disc pl-5 text-slate-700 space-y-2">
            <li>Answer each question to the best of your ability.</li>
            <li>You can navigate between questions before submitting.</li>
            <li>The timer begins when you start the quiz.</li>
            <li>You must score at least {quiz.passingScorePercent}% to pass.</li>
          </ul>
        </section>
      </div>
    </AppLayout>
  )
}
