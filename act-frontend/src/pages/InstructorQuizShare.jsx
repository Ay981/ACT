import { useRef, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import QRCode from 'qrcode'

export default function InstructorQuizShare() {
  const { id } = useParams()
  // In a real app, this would use the real ID. Since we are transitioning,
  // we treat the ID as possibly being the title (legacy) or the numeric ID (new).
  
  // Construct the student link.
  // Assuming we'll build a student take page at /quiz/:id
  const shareUrl = `${window.location.origin}/quiz/${id}`
  const [qrSrc, setQrSrc] = useState('')
  
  const copyBtnRef = useRef(null)

  useEffect(() => {
    // Generate QR code
    QRCode.toDataURL(shareUrl, { width: 400, margin: 2 })
      .then(url => setQrSrc(url))
      .catch(err => console.error(err))
  }, [shareUrl])

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    if (copyBtnRef.current) {
        copyBtnRef.current.innerText = 'Copied!'
        setTimeout(() => copyBtnRef.current.innerText = 'Copy Link', 2000)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 text-center pt-10 px-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quiz Published!</h1>
          <p className="mt-2 text-muted-foreground">Your quiz is now live and ready for students.</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-left">
          <label className="text-sm font-medium text-foreground">Share Link</label>
          <div className="mt-2 flex gap-2">
            <input readOnly value={shareUrl} className="flex-1 rounded-xl border border-input bg-background text-foreground px-3" />
            <button ref={copyBtnRef} onClick={copyLink} className="px-4 py-2 bg-card border border-border rounded-xl font-medium text-foreground hover:bg-muted transition">
              Copy Link
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Share this link with your students. They will need to log in to take the quiz.
          </p>
          
          {/* QR Code Section */}
          {qrSrc && (
            <div className="mt-6 flex flex-col items-center border-t border-border pt-6">
              <label className="text-sm font-medium text-foreground mb-3">QR Code</label>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-muted">
                <img src={qrSrc} alt="Quiz QR Code" className="w-48 h-48 object-contain" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Scan with mobile device to start quiz</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/instructor/dashboard" className="px-6 py-2.5 text-muted-foreground hover:bg-muted rounded-xl transition">
            Back to Dashboard
          </Link>
          <Link to={`/quiz/${id}`} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm shadow-primary-500/20">
            View Quiz
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
