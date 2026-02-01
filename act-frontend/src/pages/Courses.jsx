import AppLayout from '../layouts/AppLayout.jsx'
import CourseCard from '../components/CourseCard.jsx'
import QuickCommentModal from '../components/QuickCommentModal.jsx'
import { getAllCourses } from '../lib/api.js'
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'

export default function Courses(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [level, setLevel] = useState('All')

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Update URL when search query changes
  useEffect(() => {
    if (query) {
      setSearchParams({ search: query })
    } else {
      setSearchParams({})
    }
  }, [query, setSearchParams])

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = query.toLowerCase()
      // Use fallback properties if DB fields differ from mock
      const title = c.title || ''
      const category = c.category || ''
      
      const matchesQ = !q || title.toLowerCase().includes(q) || category.toLowerCase().includes(q)
      const matchesLevel = level === 'All' || c.level === level
      return matchesQ && matchesLevel
    })
  }, [query, level, courses])

  // Simple adaptation layer for Card component expecting 'course' prop
  const adaptedCourses = filtered.map(c => {
    // Handle image URL - if it's a storage path, prepend API URL
    let imageUrl = c.thumbnail
    if (imageUrl && imageUrl.startsWith('/storage')) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        imageUrl = apiBase.replace(/\/$/, '') + imageUrl
    }

    return {
      ...c,
      id: c.id,
      title: c.title,
      image: imageUrl, // Card expects image
      difficulty: c.level, // Card expects difficulty
      lessons: c.lessons_count, // Card expects lessons
      rating: 4.8, // Mock
      students: 100, // Mock
      author: 'Instructor', // Mock
      tags: [c.category],
      description: c.description
  }})

  if (loading) return <AppLayout><div className="flex justify-center p-10"><Spinner /></div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="bg-card border border-border rounded-2xl p-5">
          <h1 className="text-2xl font-semibold text-foreground">Browse Courses</h1>
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 flex-1 border border-transparent focus-within:border-primary/50 transition-colors">
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or category" className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground" />
            </div>
            <select value={level} onChange={e=>setLevel(e.target.value)} className="rounded-xl border-border bg-background text-foreground text-sm px-3 py-2">
              {['All','Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </header>

        <section>
          {adaptedCourses.length === 0 ? (
             <div className="text-center text-muted-foreground py-10">No courses available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {adaptedCourses.map(c => (
                <CourseCard key={c.id} course={c} />
                ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}

function SearchIcon(props){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-3.6-3.6"/></svg>
  )
}
