import { useState } from 'react'

export default function PostVideoModal({ open, onClose, courses = [], onPost }) {
  if (!open) return null

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeLink: '',
    courseId: courses[0]?.id || '',
    duration: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onPost) {
      onPost(formData)
    }
    // Reset form or keep? Reset makes sense.
    setFormData({
        title: '',
        description: '',
        youtubeLink: '',
        courseId: courses[0]?.id || '',
        duration: '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Upload Course Video</h3>
          <button 
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"  
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              required
            >
              <option value="" disabled>Choose a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Video Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="e.g. Introduction to React Hooks"
              required
            />
          </div>

          {/* YouTube Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Link</label>
            <input
              type="url"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="https://youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">Upload your video to YouTube first, then paste the link here.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="Briefly describe what this video covers..."
            />
          </div>

          {/* Duration (Optional but good) */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
             <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="e.g. 15:30"
             />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium text-sm shadow-sm shadow-primary-200 transition-colors"
            >
              Post Video
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
