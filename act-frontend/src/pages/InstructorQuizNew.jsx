import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import { generateQuiz as apiGenerateQuiz, createQuiz as apiCreateQuiz, getInstructorCourses } from '../lib/api.js'

const steps = ['Details', 'Questions', 'Preview']

export default function InstructorQuizNew() {
  const location = useLocation()
  const [active, setActive] = useState(0)
  
  // New state for course selection
  const [courses, setCourses] = useState([])
  
  // If we have course state, use it to initial subject
  const initialSubject = location.state?.courseTitle ? location.state.courseTitle : ''

  const [form, setForm] = useState({
    title: location.state?.courseTitle ? `Quiz for ${location.state.courseTitle}` : '',
    description: '',
    subject: initialSubject, 
    courseId: location.state?.courseId || '', 
    difficulty: 'Beginner',
    timeLimitMinutes: 10,
    passingScorePercent: 70,
    immediateResults: true,
    questionCount: 6,
  })

  useEffect(() => {
    // Fetch instructor courses for the dropdown
    getInstructorCourses().then(data => {
        setCourses(data)
    }).catch(err => {
        console.error("Failed to fetch courses", err)
        setCourses([])
    })
  }, [])

  const [questions, setQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const abortRef = useRef(null)
  const [quizId, setQuizId] = useState('')

  const canNext = useMemo(() => {
    if (active === 0) return form.title.trim().length > 0
    if (active === 1) return questions.length > 0
    return true
  }, [active, form, questions])

  function addQuestion() {
    const id = `q${questions.length + 1}`
    setQuestions([...questions, {
      id,
      type: 'multiple-choice',
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: 0,
    }])
  }

  async function generateAI() {
    setGenError('')
    setIsGenerating(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      // Pass courseId if selected
      const payload = {
          topic: form.subject, // Fallback if no course
          course_id: form.courseId || null,
          difficulty: form.difficulty,
          count: form.questionCount,
      }
      
      const resp = await apiGenerateQuiz(payload, { signal: controller.signal })

      // Expect resp.quiz.questions or resp.questions (depending on what controller returns)
      // Controller returns { message, quiz: { ..., questions: [...] } }
      const rawQuestions = resp.quiz ? resp.quiz.questions : (resp.questions || [])
      
      const mapped = rawQuestions.map((q, idx) => ({
        id: q.id || `q${idx + 1}`,
        type: 'multiple-choice',
        prompt: q.prompt || '',
        // Map backend options (array of objects {content, is_correct}) to frontend string array
        // But backend options are returned as objects.
        // Frontend expects string array for [0..3]
        options: Array.isArray(q.options) 
          ? q.options.map(o => (o && typeof o === 'object' ? o.content : o) || '').slice(0,4)
          : ['', '', '', ''],
        correctIndex: (q.correctIndex !== undefined && q.correctIndex !== null)
            ? Number(q.correctIndex)
            : (q.options && Array.isArray(q.options) ? q.options.findIndex(o => o.is_correct) : 0),
      }))
      if (mapped.length === 0) throw new Error('Empty response')
      setQuestions(mapped)
    } catch (e) {
      setGenError(`Generation failed${e?.message ? ': ' + e.message : ''}. Please try again later.`)
    } finally {
      setIsGenerating(false)
      abortRef.current = null
    }
  }

  async function publish() {
    setPublishError('')
    setIsPublishing(true)
    try {
      // Ensure courseId is null if empty string, and correctIndex is valid
      const cleanedQuestions = questions.map(q => ({
          ...q,
          options: q.options.map(o => o || 'Option'), // Ensure no empty options if possible, or allow empty string but validate on backend
          correctIndex: Math.max(0, q.correctIndex) // Ensure non-negative
      }))

      const payload = { 
          ...form, 
          courseId: form.courseId ? Number(form.courseId) : null,
          questions: cleanedQuestions 
      }
      // The API now returns { message, id, quiz }
      const resp = await apiCreateQuiz(payload)
      const newId = resp?.id || ''
      setQuizId(newId)
      // Redirect to share page with the real ID
      window.location.href = `/instructor/quizzes/${newId}/share`
    } catch (e) {
      setPublishError('Publish failed: ' + (e.message || 'Unknown error'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold">Create Quiz</h1>
          <p className="mt-1 text-slate-600">Instructor wizard: Details → Generate with AI → Preview & Publish</p>
          <Stepper steps={steps} active={active} onSelect={setActive} />
        </header>

        {active === 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Details & Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Source Course</label>
                 <select 
                     className="block w-full rounded-xl border-slate-300 shadow-sm px-3 py-2 border"
                     value={form.courseId} 
                     onChange={e => {
                         const c = courses.find(x => String(x.id) === e.target.value)
                         setForm({
                            ...form, 
                            courseId: e.target.value, 
                            subject: c ? c.title : '', 
                            title: c ? `Quiz: ${c.title}` : form.title 
                         })
                     }}
                 >
                     <option value="">-- Select a Course (Optional) --</option>
                     {courses.map(c => (
                         <option key={c.id} value={c.id}>{c.title}</option>
                     ))}
                 </select>
                 <p className="text-xs text-slate-500 mt-1">Select one of your courses to help the AI generate relevant questions based on its lessons (YouTube links & PDF resources).</p>
              </div>

              <div>
                <label className="text-sm text-slate-600">Title</label>
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Quiz title" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Subject / Topic</label>
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" 
                       value={form.subject} 
                       onChange={e=>setForm({...form, subject:e.target.value})} 
                       placeholder="e.g. History of AI"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-600">Description</label>
                <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Short description" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Difficulty</label>
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.difficulty} onChange={e=>setForm({...form, difficulty:e.target.value})}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Time Limit (minutes)</label>
                <input type="number" min="1" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.timeLimitMinutes} onChange={e=>setForm({...form, timeLimitMinutes:Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Passing Score (%)</label>
                <input type="number" min="0" max="100" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.passingScorePercent} onChange={e=>setForm({...form, passingScorePercent:Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Number of Questions</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50" 
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.questionCount} 
                  onChange={e=>setForm({...form, questionCount: e.target.value === '' ? '' : Number(e.target.value)})} 
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">How many questions to draft during generation</p>
              <div className="flex items-center gap-2">
                <input id="immediate" type="checkbox" checked={form.immediateResults} onChange={e=>setForm({...form, immediateResults:e.target.checked})} />
                <label htmlFor="immediate" className="text-sm text-slate-700">Show results immediately</label>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button disabled={!canNext} onClick={()=>setActive(1)} className={`px-4 py-2 rounded-xl ${canNext? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-slate-200 text-slate-500'}`}>Next: Generate</button>
            </div>
          </section>
        )}

        {active === 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Generate with AI</h2>
            <p className="text-slate-600">Use form context to draft questions. Edit later in Preview.</p>
            <div className="flex items-center gap-3">
              <button title="Generate questions using the details above" disabled={isGenerating} onClick={generateAI} className={`px-4 py-2 rounded-xl ${isGenerating ? 'bg-slate-200 text-slate-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>{isGenerating ? 'Generating…' : 'Generate'}</button>
              <button onClick={addQuestion} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Add Question</button>
            </div>
            {genError && <div className="text-sm text-amber-700">{genError}</div>}
            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="text-slate-600">No questions yet. Click Generate or Add Question.</div>
              ) : questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Question {idx+1}</span>
                    <button onClick={()=>setQuestions(questions.filter(x=>x.id!==q.id))} className="text-rose-700 text-sm">Remove</button>
                  </div>
                  <textarea className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2" rows={2} placeholder="Prompt" value={q.prompt} onChange={e=>updateQuestion(q.id,{ prompt:e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt,i)=> (
                      <div key={i} className="flex items-start gap-2">
                        <input type="radio" className="mt-3" name={`correct-${q.id}`} checked={q.correctIndex===i} onChange={()=>updateQuestion(q.id,{ correctIndex:i })} />
                        <textarea className="flex-1 rounded-xl border border-slate-300 px-3 py-2 resize-none" rows={2} placeholder={`Option ${i+1}`} value={opt} onChange={e=>updateOption(q.id,i,e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button onClick={()=>setActive(0)} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Back</button>
              <button disabled={!canNext} onClick={()=>setActive(2)} className={`px-4 py-2 rounded-xl ${canNext? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-slate-200 text-slate-500'}`}>Next: Preview</button>
            </div>
          </section>
        )}

        {active === 2 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Preview & Publish</h2>
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-primary-700">
              <div className="font-medium">{form.title || 'Untitled Quiz'}</div>
              <div className="text-sm">{form.description || 'No description'}</div>
              <div className="mt-2 text-sm">{questions.length} questions • {form.timeLimitMinutes} min • Pass {form.passingScorePercent}%</div>
            </div>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200">
                  <div className="font-medium">Q{idx+1}. {q.prompt || '—'}</div>
                  <ul className="mt-2 text-sm text-slate-700 space-y-1">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`flex items-start gap-2 ${i===q.correctIndex ? 'text-green-700 font-semibold bg-green-50 p-2 rounded-lg' : 'p-2'}`}>
                          <span>{String.fromCharCode(65+i)}.</span>
                          <span>{opt || '—'}</span>
                          {i===q.correctIndex && <span className="ml-auto bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Correct</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button onClick={()=>setActive(1)} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Back</button>
              <button disabled={isPublishing} onClick={publish} className={`px-4 py-2 rounded-xl ${isPublishing ? 'bg-slate-200 text-slate-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>{isPublishing ? 'Publishing…' : 'Publish'}</button>
              {publishError && <span className="text-sm text-amber-700">{publishError}</span>}
              <a href={`/instructor/quizzes/${encodeURIComponent(quizId || form.title || 'new')}/share`} className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Share</a>
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">Save Draft</button>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )

  function updateQuestion(id, patch){
    setQuestions((qs)=> qs.map(q=> q.id===id ? { ...q, ...patch } : q))
  }

  function updateOption(id, index, value){
    setQuestions((qs)=> qs.map(q=> {
      if (q.id!==id) return q
      const options = [...q.options]
      options[index] = value
      return { ...q, options }
    }))
  }
}

function Stepper({ steps, active, onSelect }){
  return (
    <div className="mt-4 flex items-center gap-2">
      {steps.map((label, i) => {
        const isActive = i === active
        return (
          <button key={label} onClick={()=>onSelect(i)} className={`px-3 py-1.5 rounded-xl text-sm border transition ${isActive ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
            {label}
          </button>
        )
      })}
    </div>
  )
}
