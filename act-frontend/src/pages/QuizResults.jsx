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
        <header className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-foreground">My Results</h1>
          <p className="mt-1 text-slate-600 dark:text-muted-foreground">Your recent quiz attempts.</p>
        </header>

        <section className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6">
          {loading ? <div className="text-center py-4 text-slate-500 dark:text-muted-foreground">Loading...</div> : 
           attempts.length === 0 ? (
            <p className="text-slate-600 dark:text-muted-foreground">No attempts yet. Start a quiz from the course page.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-border">
              {attempts.map(a => {
                return (
                  <div key={a.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-foreground">{a.title}</div>
                      <div className="text-sm text-slate-600 dark:text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg text-sm border ${a.passed ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'}`}>{a.passed ? 'Passed' : 'Failed'}</div>
                      <div className="text-slate-800 dark:text-card-foreground font-semibold">{a.percent}%</div>
                      <Link to={`/quizzes/${a.quizId}/result`} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-input hover:bg-slate-50 dark:hover:bg-accent text-sm text-slate-700 dark:text-foreground">View</Link>
                      <Link to={`/quizzes/${a.quizId}/take`} className="px-3 py-2 rounded-xl bg-primary-600 dark:bg-primary text-white dark:text-primary-foreground hover:bg-primary-700 dark:hover:bg-primary/90 text-sm">Retake</Link>
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
