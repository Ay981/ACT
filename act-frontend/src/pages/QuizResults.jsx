import AppLayout from '../layouts/AppLayout.jsx'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMyAttempts } from '../lib/api.js'

export default function QuizResults() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyAttempts().then(setAttempts).catch(console.error).finally(()=>setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">My Results</h1>
          <p className="mt-1 text-slate-600">Your recent quiz attempts.</p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          {loading ? <div className="text-center py-4">Loading...</div> : 
           attempts.length === 0 ? (
            <p className="text-slate-600">No attempts yet. Start a quiz from the course page.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {attempts.map(a => {
                return (
                  <div key={a.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-slate-600">{new Date(a.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg text-sm border ${a.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{a.passed ? 'Passed' : 'Failed'}</div>
                      <div className="text-slate-800 font-semibold">{a.percent}%</div>
                      <Link to={`/quizzes/${a.quizId}/result`} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">View</Link>
                      <Link to={`/quizzes/${a.quizId}/take`} className="px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-sm">Retake</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
