import AppLayout from '../layouts/AppLayout.jsx'
import CourseCard from '../components/CourseCard.jsx'
import { useState, useEffect } from 'react'
import { getEnrolledCourses, getAllCourses, fetchDashboardData } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [recentAttempts, setRecentAttempts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getEnrolledCourses().catch(err => {
        console.warn("Not logged in or no courses", err)
        return []
      }),
      getAllCourses().catch(err => []),
      fetchDashboardData().catch(err => null)
    ]).then(([myCourses, allCourses, dashboardData]) => {
      setEnrolledCourses(myCourses)
      setRecommendedCourses(allCourses.slice(0, 3)) // Show top 3
      if (dashboardData) {
          setStats(dashboardData.stats)
          setRecentAttempts(dashboardData.recentAttempts || [])
      }
    }).finally(() => setIsLoading(false))
  }, [])

  const adaptCourse = (c) => {
    // Handle image URL
    let imageUrl = c.thumbnail
    if (imageUrl && imageUrl.startsWith('/storage')) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        imageUrl = apiBase.replace(/\/$/, '') + imageUrl
    }
    
    return {
      ...c, 
      image: imageUrl,
      difficulty: c.level,
      lessons: c.lessons_count || 0,
      studentCount: c.students_count || 0,
      rating: 0 // No rating system yet
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center p-20"><Spinner /></div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-8 px-4 sm:px-0 max-w-7xl mx-auto space-y-12">
        
        {/* Stats Section */}
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                    <div className="text-slate-500 dark:text-muted-foreground text-sm font-medium mb-1">Total Attempts</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-card-foreground">{stats.attemptCount}</div>
                </div>
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                    <div className="text-slate-500 dark:text-muted-foreground text-sm font-medium mb-1">Average Score</div>
                    <div className={`text-3xl font-bold ${stats.avgScore >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                        {stats.avgScore}%
                    </div>
                </div>
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                    <div className="text-slate-500 dark:text-muted-foreground text-sm font-medium mb-1">Active Courses</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-card-foreground">{enrolledCourses.length}</div>
                </div>
                 <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                    <div className="text-slate-500 dark:text-muted-foreground text-sm font-medium mb-1">Available Quizzes</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-card-foreground">{stats.totalQuizzes}</div>
                </div>
            </div>
        )}

        {/* Recent Activity */}
        {recentAttempts.length > 0 && (
            <div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-4">Recent Quiz Attempts</h2>
                 <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border overflow-hidden">
                    {recentAttempts.map((attempt, i) => (
                        <div key={attempt.id} className={`p-4 flex items-center justify-between ${i !== recentAttempts.length -1 ? 'border-b border-slate-50 dark:border-border' : ''}`}>
                            <div>
                                <div className="font-semibold text-slate-800 dark:text-card-foreground">{attempt.quizTitle}</div>
                                <div className="text-xs text-slate-500 dark:text-muted-foreground">{new Date(attempt.timestamp).toLocaleDateString()}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${attempt.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {attempt.percent}%
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* My Learning Section */}
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">My Learning</h1>
           {enrolledCourses.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {enrolledCourses.map(c => (
                 <CourseCard key={c.id} course={adaptCourse(c)} />
               ))}
             </div>
           ) : (
             <div className="bg-slate-50 dark:bg-muted/50 border border-dashed border-slate-300 dark:border-border rounded-2xl p-10 text-center">
                <p className="text-slate-500 dark:text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Browse Courses</Link>
             </div>
           )}
        </div>

        {/* Recommended Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground">Recommended For You</h2>
              <p className="text-slate-500 dark:text-muted-foreground mt-2">Check out these popular courses</p>
            </div>
            <Link to="/courses" className="px-6 py-2.5 border border-slate-300 dark:border-border rounded-full text-slate-700 dark:text-foreground font-semibold hover:bg-slate-50 dark:hover:bg-accent transition-colors whitespace-nowrap">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedCourses.map(c => (
              <CourseCard
                key={c.id}
                course={adaptCourse(c)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
