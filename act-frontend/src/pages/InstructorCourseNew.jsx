import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import { createCourse, addLesson, generateCourseOutline } from '../lib/api.js'

const steps = ['Details', 'Lessons', 'Review']

export default function InstructorCourseNew() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [courseId, setCourseId] = useState(null)
  
  const [details, setDetails] = useState({
    title: '',
    description: '',
    category: 'General',
    level: 'Beginner',
    price: 0,
    thumbnail: null
  })

  // Local state for lessons being added
  const [lessons, setLessons] = useState([])
  const [newLesson, setNewLesson] = useState({ title: '', description: '', youtube_url: '', resource_url: '' })
  
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')

  // AI Magic ✨
  async function handleAiMagic() {
      // If we have a title, use it as topic. If not, prompt user?
      // For now let's just use the title field as the "topic" prompt
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
          
          // We can't auto-create lessons yet because we need a course ID first (backend limitation)
          // But we can store them in a temporary state to be added after course creation?
          // For now, let's append the lesson plan to the description so the user sees it
          const plan = outline.lessons.map(l => `- ${l.title}: ${l.description}`).join('\n')
          setDetails(prev => ({
              ...prev,
              description: prev.description + "\n\nProposed Outline:\n" + plan
          }))

      } catch (e) {
          setError('AI Generation Failed: ' + e.message)
      } finally {
          setAiLoading(false)
      }
  }

  // 1. Create Course (Metadata)
  async function handleCreateCourse() {
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

        const course = await createCourse(formData)
        setCourseId(course.id)
        setActive(1) // Move to Lessons
    } catch (e) {
        setError(e.message)
    } finally {
        setLoading(false)
    }
  }

  // 2. Add Lesson
  async function handleAddLesson() {
      if (!newLesson.title) return
      setLoading(true)
      try {
          const formData = new FormData()
          formData.append('title', newLesson.title)
          formData.append('description', newLesson.description)
          if (newLesson.youtube_url) formData.append('youtube_url', newLesson.youtube_url)
          if (newLesson.resource_url) formData.append('resource_url', newLesson.resource_url)
          
          const savedLesson = await addLesson(courseId, formData)
          
          setLessons([...lessons, savedLesson])
          setNewLesson({ title: '', description: '', youtube_url: '', resource_url: '' })
      } catch (e) {
          setError(e.message)
      } finally {
          setLoading(false)
      }
  }

  function handleFinish() {
      navigate('/instructor/dashboard')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Create New Course</h1>
          <p className="mt-1 text-slate-600">Upload and structure your learning materials.</p>
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
                    <label className="block text-sm font-medium text-slate-700">Thumbnail Image</label>
                    <input type="file" accept="image/*" className="mt-1 block w-full" 
                           onChange={e => setDetails({...details, thumbnail: e.target.files[0]})} />
                </div>

                <div className="pt-4">
                    <button onClick={handleCreateCourse} disabled={loading || !details.title} 
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create & Continue'}
                    </button>
                </div>
            </section>
        )}

        {active === 1 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                     <h2 className="text-lg font-medium">Add Lessons</h2>
                     <button onClick={() => setActive(2)} className="text-sm text-slate-500 hover:text-slate-800">Skip to Review</button>
                </div>
                
                {lessons.length > 0 && (
                    <div className="space-y-2">
                        {lessons.map((l, idx) => (
                            <div key={l.id || idx} className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span>{idx+1}. {l.title}</span>
                                <span className="text-xs text-slate-500">{l.content_type}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t pt-4 space-y-4">
                    <h3 className="text-sm font-medium text-slate-900">New Lesson</h3>
                     {error && <div className="text-red-600 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Lesson Title</label>
                        <input className="mt-1 block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" 
                               placeholder="e.g. Introduction to Machine Learning"
                               value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea className="mt-1 block w-full rounded-md border-slate-300 shadow-sm px-3 py-2 border" rows={3}
                                  value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Video Content</label>
                        <div className="mt-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">YouTube Video URL</span>
                                <input type="url" placeholder="https://youtube.com/watch?v=..." className="mt-2 block w-full rounded-md border-slate-300 px-3 py-2 border shadow-sm"
                                    value={newLesson.youtube_url} onChange={e => setNewLesson({...newLesson, youtube_url: e.target.value})} />
                                <p className="mt-1 text-xs text-slate-500">Add a YouTube video for this lesson</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Additional Resources</label>
                        <input type="url" placeholder="https://drive.google.com/..." className="mt-1 block w-full rounded-md border-slate-300 px-3 py-2 border shadow-sm"
                               value={newLesson.resource_url} onChange={e => setNewLesson({...newLesson, resource_url: e.target.value})} />
                        <p className="mt-1 text-xs text-slate-500">Google Drive link to PDFs, documents, or other resources</p>
                    </div>

                    <div className="pt-4">
                        <button onClick={handleAddLesson} disabled={loading || !newLesson.title} 
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add Lesson'}
                        </button>
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button onClick={() => setActive(2)} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                        Next: Review
                    </button>
                </div>
            </section>
        )}

        {active === 2 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-center">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-bold">Course Created!</h2>
                <p className="text-slate-600">You have successfully created "{details.title}" with {lessons.length} lessons.</p>
                <div className="pt-6">
                    <button onClick={handleFinish} className="bg-primary-600 text-white px-8 py-2 rounded-lg hover:bg-primary-700">
                        Go to Dashboard
                    </button>
                </div>
            </section>
        )}
      </div>
    </AppLayout>
  )
}
