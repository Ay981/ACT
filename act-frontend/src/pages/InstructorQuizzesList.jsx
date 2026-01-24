import { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import { getInstructorQuizzes } from '../lib/api.js'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'

export default function InstructorQuizzesList(){
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstructorQuizzes()
        .then(setQuizzes)
        .catch(console.error)
        .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">My Quizzes</h1>
          <p className="mt-1 text-slate-600">List of quizzes you created.</p>
        </header>
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          {loading ? (
             <div className="flex justify-center p-10"><Spinner /></div>
          ) : quizzes.length === 0 ? (
            <div className="text-slate-600">No quizzes yet. Create one from the header.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {quizzes.map(q => (
                <div key={q.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{q.title}</div>
                    <div className="text-sm text-slate-600">{q.category} • {q.difficulty} • {q.questions_count || q.questionCount} questions</div>
                    <div className="text-xs text-slate-500">Created {new Date(q.created_at || q.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/instructor/quizzes/${q.id}/results`} className="px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-sm">Results</Link>
                    <Link to={`/instructor/quizzes/${q.id}/share`} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">Share</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}

