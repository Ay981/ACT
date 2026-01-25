import AppLayout from '../layouts/AppLayout.jsx'
import { Link } from 'react-router-dom'
import { getInstructorDashboardStats } from '../lib/api.js'
import StatCard from '../components/StatCard.jsx'
import { useState, useEffect } from 'react'

export default function InstructorDashboard(){
  const [stats, setStats] = useState({
      metrics: {
          total_quizzes: { value: 0, delta: null },
          active_courses: { value: 0, delta: null },
          students: { value: 0, delta: null },
          avg_completion: { value: 0, suffix: '%', delta: null }
      },
      recent_quizzes: [],
      active_courses: [],
      top_students: []
  })

  useEffect(() => {
    getInstructorDashboardStats().then(setStats).catch(console.error)
  }, [])

  const { metrics, recent_quizzes: recentQuizzes, active_courses: activeCourses, top_students: topStudents } = stats

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link to="/instructor/courses/new" className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium">Create Course</Link>
            <Link to="/instructor/quizzes/new" className="px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-sm">Create New Quiz</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Quizzes" value={metrics.total_quizzes.value} delta={metrics.total_quizzes.delta} />
            <StatCard label="Active Courses" value={metrics.active_courses.value} delta={metrics.active_courses.delta} />
            <StatCard label="Students" value={metrics.students.value} delta={metrics.students.delta} />
            <StatCard label="Avg. Completion" value={`${metrics.avg_completion.value}%`} delta={metrics.avg_completion.delta} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
               <Link
                  to="/instructor/courses/new"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-primary-500 hover:text-primary-600 transition-colors group"
                >
                  <div className="w-10 h-10 mb-2 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <svg className="w-6 h-6 text-slate-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Create Course</span>
                  <span className="text-xs text-slate-500 mt-1">Upload video and lessons</span>
               </Link>
               <Link
                  to="/instructor/quizzes/new"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-primary-500 hover:text-primary-600 transition-colors group"
                >
                  <div className="w-10 h-10 mb-2 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <svg className="w-6 h-6 text-slate-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="font-semibold">Create Quiz</span>
                  <span className="text-xs text-slate-500 mt-1">Set up new assessment</span>
               </Link>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                 <h2 className="font-semibold">My Uploaded Courses</h2>
                 <Link to="/instructor/courses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {activeCourses.length === 0 ? <div className="text-sm text-slate-500">No courses yet.</div> : activeCourses.slice(0, 4).map(c => (
                  <div key={c.id} className="group rounded-xl border border-slate-200 p-3 hover:border-primary-200 hover:bg-slate-50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg shrink-0 flex items-center justify-center font-bold text-lg overflow-hidden">
                         {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" /> : c.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-slate-900">{c.title}</div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                           <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{c.level || c.difficulty || 'Beginner'}</span>
                           <span>•</span>
                           <span className="flex items-center text-amber-500">★ {c.rating || 'New'}</span>
                           <span>•</span>
                           <span>{c.students || 0} Students</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                           <Link 
                              to="/instructor/quizzes/new" 
                              state={{ courseTitle: c.title, courseId: c.id }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm"
                            >
                             + Quiz
                           </Link>
                           <Link 
                              to={`/instructor/courses/${c.id}/edit`} 
                              className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm"
                            >
                             ✏️ Edit Course
                           </Link>
                           <Link to={`/courses/${c.id}`} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm">
                             Manage
                           </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <h2 className="font-semibold">Recent Quizzes</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {recentQuizzes.map(q => (
                  <div key={q.id} className="rounded-xl border border-slate-200 p-3 bg-gradient-to-b from-slate-50 to-white">
                    <div className="font-medium">{q.title}</div>
                    <div className="text-xs text-slate-600">{q.questionCount} questions • {q.completions} completions</div>
                    <div className="mt-2">
                      <div className="text-xs text-slate-600">Completion Rate</div>
                      <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600" style={{ width: `${q.passRate}%` }} />
                      </div>
                      <div className="text-right text-xs text-slate-600 mt-1">{q.passRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/instructor/quizzes/new" className="w-full inline-flex justify-center items-center rounded-xl bg-slate-900 text-white py-3">Create New Quiz</Link>
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl bg-slate-900 text-white p-4">
              <h2 className="font-semibold">Top Students</h2>
              <div className="mt-3 space-y-3">
                {topStudents.length === 0 && <div className="text-slate-300">No data yet.</div>}
                {topStudents.map((s, i) => (
                  <div key={s.userId || s.userName} className="flex items-center gap-3">
                    <div className="w-6 h-6 grid place-items-center rounded-full bg-primary-600 text-white text-xs font-semibold">{i+1}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{s.userName || 'Anonymous'}</div>
                      <div className="text-xs text-slate-300">Score</div>
                    </div>
                    <div className="text-sm font-semibold">{s.percent}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </AppLayout>
  )
}
