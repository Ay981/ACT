import React from 'react'
import { Link } from 'react-router-dom'

export default function CourseCard({ course }) {
  const isFree = course.price === 'Free'
  const studentCount = course.students_count ?? course.studentCount ?? course.students ?? 0
  const postedLabel = getRelativeTime(course.created_at)

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
          <img 
           src={
            course.thumbnail_url
              ? course.thumbnail_url
              : course.thumbnail 
               ? (course.thumbnail.startsWith('http') 
                 ? course.thumbnail 
                 : `${import.meta.env.VITE_API_BASE_URL || window.location.origin}${course.thumbnail}`)
               : (course.image 
                 ? (course.image.startsWith('http') 
                   ? course.image 
                   : `${import.meta.env.VITE_API_BASE_URL || window.location.origin}${course.image}`)
                 : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
           } 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground text-[10px] uppercase tracking-wide font-bold px-3 py-1 rounded">
            {course.category || 'Photography'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Author */}
        <div className="text-muted-foreground text-xs mb-2">
          by <span className="text-foreground font-medium">{course.author || 'Determined-Poitras'}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground leading-snug mb-4 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{postedLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>{studentCount} Students</span>
          </div>
        </div>

        <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.oldPrice && (
              <span className="text-muted-foreground text-sm line-through decoration-muted-foreground">
                ${typeof course.oldPrice === 'number' ? course.oldPrice.toFixed(1) : course.oldPrice}
              </span>
            )}
            <span className={`font-bold ${isFree ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {isFree ? 'Free' : `$${typeof course.price === 'number' ? course.price.toFixed(1) : course.price}`}
            </span>
          </div>
          <Link to={`/courses/${course.id}`} className="text-sm font-bold text-foreground hover:text-primary-600 transition-colors">
            View More
          </Link>
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffMs = Date.now() - date.getTime()
  if (diffMs <= 0) return 'Recently'

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes || 1} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`

  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
