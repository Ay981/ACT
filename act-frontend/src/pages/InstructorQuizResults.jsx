import AppLayout from '../layouts/AppLayout.jsx'
import { useParams, Link } from 'react-router-dom'
import { getQuiz } from '../data/instructorQuizzes.js'
import { getAttempts } from '../data/quizAttempts.js'
import { fetchQuiz, getQuizAttempts } from '../lib/api.js'
import { useState, useEffect } from 'react'

export default function InstructorQuizResults(){
  const { id } = useParams()
  
  const [quiz, setQuiz] = useState({ title: 'Loading...' })
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Determine if it's a real quiz (ID is number) or mock
    const isReal = String(id).match(/^\d+$/)
    
    if (isReal) {
        Promise.all([
            fetchQuiz(id),
            getQuizAttempts(id)
        ]).then(([qData, aData]) => {
            setQuiz(qData)
            setAttempts(aData)
        }).catch(err => console.error(err))
        .finally(() => setLoading(false))
    } else {
        // Fallback to mock
        const q = getQuiz(id)
        if (q) setQuiz(q)
        const a = getAttempts().filter(x => x.quizId === id)
        setAttempts(a)
        setLoading(false)
    }
  }, [id])

  const ranked = attempts
    .map((a) => ({
      ...a,
      score: a.percent,
    }))
    .sort((a, b) => b.score - a.score || (a.timestamp - b.timestamp))
    .map((a, i) => ({ ...a, rank: i + 1 }))

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Results: {quiz?.title || id}</h1>
          <p className="mt-1 text-slate-600">Leaderboard and attempts.</p>
          <div className="mt-3 flex items-center gap-3">
            <Link to={`/instructor/quizzes/${id}/share`} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">Share</Link>
          </div>
        </header>
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          {ranked.length === 0 ? (
            <p className="text-slate-600">No attempts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-600 text-sm">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Student</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Correct</th>
                    <th className="py-2">Passed</th>
                    <th className="py-2">Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map(a => (
                    <tr key={a.id} className="border-t border-slate-200">
                      <td className="py-2 font-medium">{a.rank}</td>
                      <td className="py-2">{a.userName || 'Anonymous'}</td>
                      <td className="py-2">{a.percent}%</td>
                      <td className="py-2">{a.correct}/{a.total}</td>
                      <td className="py-2">{a.passed ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-slate-600">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
