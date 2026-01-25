import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import { createCourse, addLesson, generateCourseOutline, getCourse, updateCourse, updateLesson, deleteLesson } from '../lib/api.js'

// Direct API call to test
async function getCourseDirect(id) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

const steps = ['Details', 'Lessons', 'Review']

export default function InstructorCourseEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
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

  // Load existing course data
  useEffect(() => {
    console.log('InstructorCourseEdit mounted, id:', id, 'initialLoad:', initialLoad)
    if (id && initialLoad) {
      loadCourse()
    }
  }, [id, initialLoad])

  async function loadCourse() {
    try {
      console.log('Loading course with ID:', id)
      console.log('Trying direct API call first...')
      const course = await getCourseDirect(id)
      console.log('Course loaded via direct call:', course)
      setDetails({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnail: null // Don't load existing thumbnail, allow user to upload new one
      })
      setLessons(course.lessons || [])
      setInitialLoad(false)
    } catch (e) {
      console.error('Failed to load course with direct call:', e)
      console.error('Trying with API function...')
      try {
        const course = await getCourse(id)
        console.log('Course loaded via API function:', course)
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
      } catch (e2) {
        console.error('Both methods failed:', e2)
        setError('Failed to load course: ' + e2.message)
        setInitialLoad(false)
      }
    }
  }

  // AI Magic ✨
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
      const formData = new FormData()
      formData.append('title', details.title)
      formData.append('description', details.description)
      formData.append('category', details.category)
      formData.append('level', details.level)
      formData.append('price', details.price)
      if (details.thumbnail) formData.append('thumbnail', details.thumbnail)

      const course = await updateCourse(courseId, formData)
      setActive(1) // Move to Lessons
    } catch (e) {
      setError(e.message)
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
          <>
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Edit Course</h1>
          <p className="mt-1 text-slate-600">Update your course content and structure.</p>
          <div className="mt-4 flex items-center gap-2">
            {steps.map((label, i) => (
                <div key={label} className={`px-3 py-1 rounded-full text-sm ${i === active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {i + 1}. {label}
                </div>
            ))}
          </div>
        </header>

        {active === 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-medium">Course Details</h2>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-slate-700">Course Topic / Title</label>
                        <button 
                            type="button" 
                            onClick={handleAiMagic}
                            disabled={aiLoading}
                            className="text-xs flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700 disabled:opacity-50"
                        >
                            {aiLoading ? (
                                <>✨ Generating...</>
                            ) : (
                                <>✨ Auto-fill with AI</>
                            )}
                        </button>
                    </div>
                    <input className="mt-1 block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" 
                           placeholder="e.g. Introduction to Machine Learning"
                           value={details.title} onChange={e => setDetails({...details, title: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea className="mt-1 block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" rows={3}
                              value={details.description} onChange={e => setDetails({...details, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <input className="mt-1 block w-full rounded-md border-slate-300 px-3 py-2 border shadow-sm"
                               placeholder="e.g. AI, Design, Marketing"
                               value={details.category} onChange={e => setDetails({...details, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Level</label>
                        <select className="mt-1 block w-full rounded-md border-slate-300 px-3 py-2 border"
                                value={details.level} onChange={e => setDetails({...details, level: e.target.value})}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Price ($)</label>
                    <input type="number" min="0" step="0.01" className="mt-1 block w-full rounded-md border-slate-300 px-3 py-2 border shadow-sm"
                           placeholder="0.00"
                           value={details.price} onChange={e => setDetails({...details, price: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Thumbnail Image (optional)</label>
                    <input type="file" accept="image/*" className="mt-1 block w-full" 
                           onChange={e => setDetails({...details, thumbnail: e.target.files[0]})} />
                </div>

                <div className="pt-4 flex gap-2">
                    <button onClick={handleUpdateCourse} disabled={loading || !details.title} 
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update & Continue'}
                    </button>
                    <button onClick={() => setActive(1)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Skip to Lessons
                    </button>
                </div>
            </section>
        )}

        {active === 1 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                     <h2 className="text-lg font-medium">Lessons</h2>
                     <button onClick={() => setActive(2)} className="text-sm text-slate-500 hover:text-slate-800">Skip to Review</button>
                </div>
                
                {lessons.length > 0 && (
                    <div className="space-y-2">
                        {lessons.map((l, idx) => (
                            <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <div className="font-medium">{idx+1}. {l.title}</div>
                                    <div className="text-xs text-slate-500">{l.content_type}</div>
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

                {/* Add/Edit Lesson Form */}
                <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                    <div className="space-y-3">
                        <input 
                            className="block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" 
                            placeholder="Lesson title"
                            value={editingLesson ? editingLesson.title : newLesson.title} 
                            onChange={e => editingLesson 
                                ? setEditingLesson({...editingLesson, title: e.target.value})
                                : setNewLesson({...newLesson, title: e.target.value})
                            } 
                        />
                        <textarea 
                            className="block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" 
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
                            className="block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" 
                            placeholder="YouTube URL (optional)"
                            value={editingLesson ? editingLesson.youtube_url : newLesson.youtube_url} 
                            onChange={e => editingLesson 
                                ? setEditingLesson({...editingLesson, youtube_url: e.target.value})
                                : setNewLesson({...newLesson, youtube_url: e.target.value})
                            } 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Video/Resource File</label>
                                <input 
                                    type="file" 
                                    accept="video/*,.pdf,.doc,.docx" 
                                    className="mt-1 block w-full" 
                                    onChange={e => editingLesson 
                                        ? setEditingLesson({...editingLesson, video: e.target.files[0]})
                                        : setNewLesson({...newLesson, video: e.target.files[0]})
                                    } 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Additional Resource (PDF/Doc)</label>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="mt-1 block w-full" 
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
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Add Lesson')}
                            </button>
                            {editingLesson && (
                                <button 
                                    onClick={() => setEditingLesson(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
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
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-medium">Review & Publish</h2>
                <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium">{details.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{details.description}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-slate-100 text-xs rounded">{details.category}</span>
                            <span className="px-2 py-1 bg-slate-100 text-xs rounded">{details.level}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">${details.price}</span>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-medium mb-2">Lessons ({lessons.length})</h4>
                        <div className="space-y-1">
                            {lessons.map((l, idx) => (
                                <div key={l.id} className="text-sm text-slate-600">{idx+1}. {l.title}</div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 flex gap-2">
                    <button onClick={handleFinish} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                        Finish Editing
                    </button>
                    <button onClick={() => setActive(1)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Back to Lessons
                    </button>
                </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  )
}
