import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'

// Import API functions for updates
import { createCourse, addLesson, generateCourseOutline, updateCourse, updateLesson, deleteLesson } from '../lib/api.js'

const steps = ['Details', 'Lessons', 'Review']

export default function InstructorCourseEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [active, setActive] = useState(0)
  const [courseId, setCourseId] = useState(id)
  
  const [details, setDetails] = useState({
    title: '',
    description: '',
    category: 'General',
    level: 'Beginner',
    price: 0,
    thumbnail: null
  })

  // Local state for lessons
  const [lessons, setLessons] = useState([])
  const [newLesson, setNewLesson] = useState({ title: '', description: '', video: null, youtube_url: '', resource: null })
  const [editingLesson, setEditingLesson] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)

  // Load course data from passed state
  useEffect(() => {
    console.log('🎯 InstructorCourseEdit mounted, id:', id)
    console.log('📍 Location state:', location.state)
    
    if (location.state?.course) {
      console.log('✅ Using passed course data:', location.state.course)
      const course = location.state.course
      setDetails({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: null
      })
      setLessons(course.lessons || [])
      setInitialLoad(false)
    } else {
      console.log('⚠️ No course data passed, showing error')
      setError('No course data available. Please go back and try again.')
      setInitialLoad(false)
    }
  }, [id, location.state])

  // AI Magic
  async function handleAiMagic() {
    if (!details.title || details.title.length < 3) {
      setError('Please enter a course topic/title first (e.g. "Advanced Python Programming")')
      return
    }

    setAiLoading(true)
    setError('')
    try {
      const outline = await generateCourseOutline(details.title, details.level)
      setDetails({
        ...details,
        title: outline.title,
        description: outline.description,
        category: outline.category || details.category,
        price: outline.price || details.price
      })
    } catch (e) {
      setError('AI Generation Failed: ' + e.message)
    } finally {
      setAiLoading(false)
    }
  }

  // Update Course
  async function handleUpdateCourse() {
    setLoading(true)
    setError('')
    try {
      console.log('Updating course with details:', details)
      
      // Always use FormData for consistency
      const formData = new FormData()
      formData.append('title', details.title)
      formData.append('description', details.description)
      formData.append('category', details.category)
      formData.append('level', details.level)
      formData.append('price', details.price)
      if (details.thumbnail) {
        formData.append('thumbnail', details.thumbnail)
        console.log('Including thumbnail in FormData')
      } else {
        console.log('No thumbnail included')
      }

      // Add _method field for Laravel FormData PUT workaround
      formData.append('_method', 'PUT')

      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      // Manual request with explicit FormData handling
      const headers = {
        'Accept': 'application/json'
        // Note: DON'T set Content-Type for FormData - browser sets it automatically with boundary
      }

      // Add CSRF token if present (for Sanctum)
      try {
        const xsrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))
        if (xsrfCookie) {
          const xsrfToken = xsrfCookie.split('=')[1]
          if (xsrfToken) {
            headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)
          }
        }
      } catch (e) {
        // Ignore if cookie not found
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/instructor/courses/${courseId}`, {
        method: 'POST', // Use POST instead of PUT for FormData
        headers,
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const course = await response.json()
      console.log('Course updated successfully:', course)
      setActive(1) // Move to Lessons
    } catch (e) {
      console.error('Update failed:', e)
      setError('Failed to update course: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // Add Lesson
  async function handleAddLesson() {
    if (!newLesson.title) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', newLesson.title)
      formData.append('description', newLesson.description)
      if (newLesson.video) formData.append('video', newLesson.video)
      if (newLesson.youtube_url) formData.append('youtube_url', newLesson.youtube_url)
      if (newLesson.resource) formData.append('resource', newLesson.resource)
      
      const savedLesson = await addLesson(courseId, formData)
      
      setLessons([...lessons, savedLesson])
      setNewLesson({ title: '', description: '', video: null, youtube_url: '', resource: null })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Update Lesson
  async function handleUpdateLesson() {
    if (!editingLesson || !editingLesson.title) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', editingLesson.title)
      formData.append('description', editingLesson.description)
      if (editingLesson.video) formData.append('video', editingLesson.video)
      if (editingLesson.youtube_url) formData.append('youtube_url', editingLesson.youtube_url)
      if (editingLesson.resource) formData.append('resource', editingLesson.resource)
      
      const updatedLesson = await updateLesson(courseId, editingLesson.id, formData)
      
      setLessons(lessons.map(l => l.id === editingLesson.id ? updatedLesson : l))
      setEditingLesson(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete Lesson
  async function handleDeleteLesson(lessonId) {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    
    try {
      await deleteLesson(courseId, lessonId)
      setLessons(lessons.filter(l => l.id !== lessonId))
    } catch (e) {
      setError(e.message)
    }
  }

  function handleFinish() {
    navigate('/instructor/dashboard')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {initialLoad ? (
          <div className="text-center py-8">
            <div className="text-slate-600">Loading course...</div>
          </div>
        ) : (
          <div>
            <header className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h1 className="text-2xl font-semibold text-foreground">Edit Course</h1>
              <p className="mt-1 text-muted-foreground">Update your course content and structure.</p>
              <div className="mt-4 flex items-center gap-2">
                {steps.map((label, i) => (
                    <div key={label} className={`px-3 py-1 rounded-full text-sm ${i === active ? 'bg-primary-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}. {label}
                    </div>
                ))}
              </div>
            </header>

            {active === 0 && (
                <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-medium text-foreground">Course Details</h2>
                    {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
                    
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-foreground">Course Topic / Title</label>
                            <button 
                                type="button" 
                                onClick={handleAiMagic}
                                disabled={aiLoading}
                                className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <span>✨ Generating...</span>
                                ) : (
                                    <span>✨ Auto-fill with AI</span>
                                )}
                            </button>
                        </div>
                        <input className="mt-1 block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-3" 
                               placeholder="e.g. Introduction to Machine Learning"
                               value={details.title} onChange={e => setDetails({...details, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Description</label>
                        <textarea className="mt-1 block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-2" rows={3}
                                  value={details.description} onChange={e => setDetails({...details, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground">Category</label>
                            <input className="mt-1 block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-3"
                                   placeholder="e.g. AI, Design, Marketing"
                                   value={details.category} onChange={e => setDetails({...details, category: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Level</label>
                            <select className="mt-1 block w-full rounded-lg bg-background border-input text-foreground border px-3 py-3"
                                    value={details.level} onChange={e => setDetails({...details, level: e.target.value})}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Price ($)</label>
                        <input type="number" min="0" step="0.01" className="mt-1 block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-3"
                               placeholder="0.00"
                               value={details.price} onChange={e => setDetails({...details, price: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Thumbnail Image (optional)</label>
                        <input type="file" accept="image/*" className="mt-1 block w-full text-foreground file:bg-primary-50 file:text-primary-700 file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:bg-primary-100" 
                               onChange={e => setDetails({...details, thumbnail: e.target.files[0]})} />
                    </div>

                    <div className="pt-4 flex gap-2">
                        <button onClick={handleUpdateCourse} disabled={loading || !details.title} 
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium">
                            {loading ? 'Updating...' : 'Update & Continue'}
                        </button>
                        <button onClick={() => setActive(1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium">
                            Skip to Lessons
                        </button>
                    </div>
                </section>
            )}

            {active === 1 && (
                <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                         <h2 className="text-lg font-medium text-foreground">Lessons</h2>
                         <button onClick={() => setActive(2)} className="text-sm text-muted-foreground hover:text-foreground">Skip to Review</button>
                    </div>
                    
                    {lessons.length > 0 && (
                        <div className="space-y-2">
                            {lessons.map((l, idx) => (
                                <div key={l.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">{idx+1}. {l.title}</div>
                                        <div className="text-xs text-muted-foreground">{l.content_type}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingLesson(l)}
                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteLesson(l.id)}
                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-border pt-4">
                        <h3 className="font-medium mb-3 text-foreground">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                        <div className="space-y-3">
                            <input 
                                className="block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-3" 
                                placeholder="Lesson title"
                                value={editingLesson ? editingLesson.title : newLesson.title} 
                                onChange={e => editingLesson 
                                    ? setEditingLesson({...editingLesson, title: e.target.value})
                                    : setNewLesson({...newLesson, title: e.target.value})
                                } 
                            />
                            <textarea 
                                className="block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-2" 
                                rows={2}
                                placeholder="Lesson description"
                                value={editingLesson ? editingLesson.description : newLesson.description} 
                                onChange={e => editingLesson 
                                    ? setEditingLesson({...editingLesson, description: e.target.value})
                                    : setNewLesson({...newLesson, description: e.target.value})
                                } 
                            />
                            <input 
                                type="url"
                                className="block w-full rounded-lg bg-background border-input text-foreground border shadow-sm px-3 py-3" 
                                placeholder="YouTube URL (optional)"
                                value={editingLesson ? editingLesson.youtube_url : newLesson.youtube_url} 
                                onChange={e => editingLesson 
                                    ? setEditingLesson({...editingLesson, youtube_url: e.target.value})
                                    : setNewLesson({...newLesson, youtube_url: e.target.value})
                                } 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Video/Resource File</label>
                                    <input 
                                        type="file" 
                                        accept="video/*,.pdf,.doc,.docx" 
                                        className="mt-1 block w-full text-foreground file:bg-primary-50 file:text-primary-700 file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:bg-primary-100" 
                                        onChange={e => editingLesson 
                                            ? setEditingLesson({...editingLesson, video: e.target.files[0]})
                                            : setNewLesson({...newLesson, video: e.target.files[0]})
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Additional Resource (PDF/Doc)</label>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx" 
                                        className="mt-1 block w-full text-foreground file:bg-primary-50 file:text-primary-700 file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:bg-primary-100" 
                                        onChange={e => editingLesson 
                                            ? setEditingLesson({...editingLesson, resource: e.target.files[0]})
                                            : setNewLesson({...newLesson, resource: e.target.files[0]})
                                        } 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={editingLesson ? handleUpdateLesson : handleAddLesson} 
                                    disabled={loading || !(editingLesson ? editingLesson.title : newLesson.title)} 
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                                >
                                    {loading ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Add Lesson')}
                                </button>
                                {editingLesson && (
                                    <button 
                                        onClick={() => setEditingLesson(null)}
                                        className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {active === 2 && (
                <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-medium text-foreground">Review & Publish</h2>
                    <div className="space-y-4">
                        <div className="border border-border rounded-lg p-4 bg-muted/20">
                            <h3 className="font-medium text-foreground">{details.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{details.description}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded border border-border">{details.category}</span>
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded border border-border">{details.level}</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">${details.price}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-2 text-foreground">Lessons ({lessons.length})</h4>
                            <div className="space-y-1">
                                {lessons.map((l, idx) => (
                                    <div key={l.id} className="text-sm text-muted-foreground">{idx+1}. {l.title}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex gap-2">
                        <button onClick={handleFinish} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium shadow-md shadow-primary-500/20">
                            Finish Editing
                        </button>
                        <button onClick={() => setActive(1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium">
                            Back to Lessons
                        </button>
                    </div>
                </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
