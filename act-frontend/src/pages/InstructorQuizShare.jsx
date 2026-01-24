import { useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'

export default function InstructorQuizShare() {
  const { id } = useParams()
  // In a real app, this would use the real ID. Since we are transitioning,
  // we treat the ID as possibly being the title (legacy) or the numeric ID (new).
  
  // Construct the student link.
  // Assuming we'll build a student take page at /quiz/:id
  const shareUrl = `${window.location.origin}/quiz/${id}`
  
  const copyBtnRef = useRef(null)

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    if (copyBtnRef.current) {
        copyBtnRef.current.innerText = 'Copied!'
        setTimeout(() => copyBtnRef.current.innerText = 'Copy Link', 2000)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 text-center pt-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quiz Published!</h1>
          <p className="mt-2 text-slate-600">Your quiz is now live and ready for students.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
          <label className="text-sm font-medium text-slate-700">Share Link</label>
          <div className="mt-2 flex gap-2">
            <input readOnly value={shareUrl} className="flex-1 rounded-xl border-slate-300 bg-slate-50 text-slate-600" />
            <button ref={copyBtnRef} onClick={copyLink} className="px-4 py-2 bg-white border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition">
              Copy Link
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Share this link with your students. They will need to log in to take the quiz.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/instructor/dashboard" className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Back to Dashboard
          </Link>
          <Link to={`/quiz/${id}`} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm shadow-primary-200">
            View Quiz
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
