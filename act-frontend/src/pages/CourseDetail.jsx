import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import Spinner from '../components/Spinner'
import CommentsSection from '../components/comments/CommentsSection'
import { getCourse, enrollCourse } from '../lib/api'
import { getUser } from '../lib/api' // To check if current user is instructor
// import { useToast } from '../components/Toast.jsx'
// import { useHeaderRefresh } from '../layouts/AppLayout.jsx'

// Helper for assets
const getAssetUrl = (path) => {
    if (!path) return 'https://placehold.co/600x400?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_BASE_URL}${path}`;
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  // const { success, error } = useToast()
  // const refreshHeader = useHeaderRefresh()
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // optional: fetch current user to verify if they are instructor
    getUser().then(u => setCurrentUser(u)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCourse(id)
      .then(data => {
        setCourse(data)
        // If the backend returns 'lessons' in the course object
        if (data.lessons) {
             setLessons(data.lessons)
        }
        // Backend should populate this
        if (data.is_enrolled) {
            setIsRegistered(true)
        }
      })
      .catch(err => console.error("Failed to load course", err))
      .finally(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    if (!currentUser) {
        // User not logged in
        if (confirm("You need to look in to enroll. Go to login page?")) {
            window.location.href = '/login'
        }
        return
    }

    try {
        await enrollCourse(id)
        setIsRegistered(true)
        // Refresh course to get potential hidden links if we implement that
        const refreshed = await getCourse(id)
        setCourse(refreshed)
        setLessons(refreshed.lessons || [])
        // success("Successfully enrolled!")
        alert("Successfully enrolled!")
        // Refresh header to update enrolled courses
        // refreshHeader()
    } catch (error) {
        console.error("Enrollment failed", error)
        if (error.status === 401) {
            // error("Please log in to continue.")
            alert("Please log in to continue.")
            window.location.href = '/login'
        } else if (error.response?.data?.message) {
            // error(error.response.data.message)
            alert(error.response.data.message)
        } else {
            // error("Enrollment failed. Please try again.")
            alert("Enrollment failed. Please try again.")
        }
    }
  }

  const isInstructor = () => {
    return currentUser && course && currentUser.id === course.instructor_id
  }

  const handleLessonClick = (lesson) => {
    if (!isRegistered && !isInstructor()) {
        alert("You must be registered to view this lesson.")
        return
    }
    // Set active lesson to show video player
    setActiveLesson(lesson)
  }

  if (loading) return <AppLayout><div className="flex justify-center p-20"><Spinner /></div></AppLayout>
  
  if (!course) return <AppLayout><div className="text-center p-20 text-muted-foreground">Course not found</div></AppLayout>

  // Use DB fields or fallbacks
  const title = course.title || 'Untitled Course'
  const image = getAssetUrl(course.thumbnail)
  const category = course.category || 'General'
  const difficulty = course.level || 'Unspecified'
  const author = course.instructor?.name || 'Instructor' 
  const description = course.description || 'No description provided.'

  const joinedCount = course.students_count || 120 // Example if API returned it

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/courses" className="hover:text-primary-600">Courses</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{title}</span>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Main Video/Thumbnail Area */}
            <div className="bg-card rounded-2xl overflow-hidden aspect-video relative shadow-lg group">
                {activeLesson ? (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
                        {/* YouTube Embed */}
                        {activeLesson.youtube_url ? (
                             <iframe 
                                className="w-full h-full"
                                src={activeLesson.youtube_url.replace('watch?v=', 'embed/')}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                             ></iframe>
                        ) : (
                          // Local Video
                             <video 
                                src={getAssetUrl(activeLesson.video_url)} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain"
                             >
                                Your browser does not support the video tag.
                             </video>
                        )}
                        
                         <button 
                            onClick={() => setActiveLesson(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition z-10"
                            title="Close Video"
                         >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                     </div>
                ) : (
                    <>
                      <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                         <div className="flex gap-2 mb-2">
                             <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">{category}</span>
                             <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">{difficulty}</span>
                         </div>
                         <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                         <div className="flex items-center gap-4 text-slate-300 text-sm">
                             <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span>{author}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <span>{joinedCount} Enrolled</span>
                             </div>
                         </div>
                      </div>
                      
                      {/* Play Button Overlay (if not registered, maybe show lock) */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {isRegistered || isInstructor() ? (
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 group-hover:scale-110 transition-transform duration-300 pointer-events-auto cursor-pointer" onClick={() => lessons.length > 0 && setActiveLesson(lessons[0])}>
                                   <svg className="w-12 h-12 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            ) : (
                                <div className="bg-black/60 p-4 rounded-full border border-white/20">
                                   <svg className="w-10 h-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                            )}
                       </div>
                    </>
                )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-8">
               <h2 className="text-xl font-bold mb-4 text-foreground">About this Course</h2>
               <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
               </div>
            </div>

            <div id="reviews" className="scroll-mt-6">
               <h2 className="text-xl font-bold mb-6 text-foreground">Student Reviews & Comments</h2>
               {/* Pass context to enable real comments */}
               <CommentsSection initialComments={[]} context={{ type: 'course', id: course.id }} currentUser={currentUser} />
            </div>
          </div>
          
          <aside className="space-y-6">
            
            {/* Call to Action Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-foreground mb-2">{course.price > 0 ? `$${course.price}` : 'Free'}</div>
                <div className="text-muted-foreground text-sm mb-6">Lifetime access with certificate</div>
                
                {isRegistered ? (
                     <div className="bg-green-500/10 text-green-600 font-bold text-center py-3 rounded-xl mb-4 border border-green-500/20">
                        You are Enrolled
                     </div>
                ) : isInstructor() ? (
                     <div className="bg-blue-500/10 text-blue-600 font-bold text-center py-3 rounded-xl mb-4 border border-blue-500/20">
                        Instructor View
                     </div>
                ) : (
                    <button 
                        onClick={handleRegister}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all mb-4"
                    >
                        Enroll Now
                    </button>
                )}
                
                {isRegistered && !isInstructor() && (
                    <Link 
                        to="/messages" 
                        state={{ initiateChat: (course.instructor?.id ?? course.instructor_id) }}
                        className="block w-full text-center text-foreground font-medium py-2 rounded-xl border border-border hover:bg-accent transition-colors mb-4 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        Message Instructor
                    </Link>
                )}

                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{lessons.length} lessons ({Math.round(lessons.length * 15 / 60)}h total)</span>
                    </li>
                    <li className="flex items-center gap-2">
                         <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                        <span>Access on mobile and web</span>
                    </li>
                     <li className="flex items-center gap-2">
                         <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Certificate of completion</span>
                    </li>
                </ul>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4 text-foreground">Course Syllabus</h3>
              {lessons.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No lessons available yet.</div>
              ) : (
                <ul className="space-y-3">
                    {lessons.map((lesson, i) => (
                    <li 
                        key={lesson.id} 
                        onClick={() => handleLessonClick(lesson)}
                        className={`group flex items-center gap-3 p-3 hover:bg-accent rounded-xl transition-all cursor-pointer border ${activeLesson && activeLesson.id === lesson.id ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:border-border'}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isRegistered || isInstructor() ? 'bg-primary-500/20 text-primary-600' : 'bg-muted text-muted-foreground'}`}>
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <span className={`text-sm font-medium block ${activeLesson && activeLesson.id === lesson.id ? 'text-primary-600' : (isRegistered ? 'text-foreground' : 'text-foreground/80')}`}>{lesson.title}</span>
                             <div className="flex gap-2">
                               {lesson.video_url && <span className="text-xs text-muted-foreground flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Video</span>}
                               {lesson.youtube_url && <span className="text-xs text-red-500 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>YouTube</span>}
                               {lesson.resource_url && (
                                   <a href={lesson.resource_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                       </svg>
                                       View Resource
                                   </a>
                               )}
                             </div>
                        </div>
                        {isRegistered || isInstructor() ? (
                            <svg className={`w-5 h-5 ${activeLesson && activeLesson.id === lesson.id ? 'text-primary-600' : 'text-muted-foreground group-hover:text-primary-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                    </li>
                    ))}
                </ul>
              )}
            </div>

            {((course.related_quizzes && course.related_quizzes.length > 0) || isInstructor()) && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-foreground">Assessments</h3>
                      {isInstructor() && (
                          <Link 
                            to="/instructor/quizzes/new" 
                            state={{ courseTitle: course.title, courseId: course.id }}
                            className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700"
                          >
                           + Create Quiz
                          </Link>
                      )}
                  </div>
                  {(!course.related_quizzes || course.related_quizzes.length === 0) ? (
                      <div className="text-muted-foreground text-sm italic">No quizzes created yet. Add one to test your students.</div>
                  ) : (
                  <ul className="space-y-3">
                      {course.related_quizzes.map(quiz => (
                          <li key={quiz.id} className="p-3 bg-secondary/20 rounded-xl border border-border hover:border-primary-200 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-foreground text-sm line-clamp-1">{quiz.title}</h4>
                                  <span className="text-xs font-bold text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded-full">{quiz.difficulty}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                  <span>{quiz.questions_count || '?'} Qs</span>
                                  <span>•</span>
                                  <span>{quiz.time_limit_minutes} min</span>
                              </div>
                              {isRegistered || isInstructor() ? (
                                  <Link 
                                      to={`/quizzes/${quiz.id}/start`}
                                      className="block w-full py-1.5 text-center bg-background border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                                  >
                                      Take Quiz
                                  </Link>
                              ) : (
                                  <button disabled className="block w-full py-1.5 text-center bg-muted text-muted-foreground rounded-lg text-xs font-semibold cursor-not-allowed">
                                      Enroll to Take
                                  </button>
                              )}
                          </li>
                      ))}
                  </ul>
                  )}
                </div>
            )}

          </aside>
        </section>
      </div>
    </AppLayout>
  )
}
