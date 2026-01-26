import { useState } from 'react'
import CommentComposer, { Avatar } from './CommentComposer.jsx'
import { submitReport } from '../../lib/api'
import { useToast } from '../Toast.jsx'

export default function CommentItem({ comment, currentUser, onReply, onEdit, onDelete, onLike }) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const { success, error } = useToast()

  const submitReply = (text) => {
    onReply?.(comment.id, text)
    setReplying(false)
  }

  const submitEdit = (text) => {
    onEdit?.(comment.id, text)
    setEditing(false)
  }

  const handleReport = async (reason) => {
      try {
          await submitReport({
              reason,
              reportable_id: comment.id,
              reportable_type: 'comment'
          })
          success('Report submitted successfully')
          setReportModalOpen(false)
      } catch (err) {
          error(err.message)
      }
  }

  const handleOtherReasonSubmit = async () => {
      if (!otherReason.trim()) {
          error('Please provide a reason for your report')
          return
      }
      
      try {
          await submitReport({
              reason: otherReason.trim(),
              reportable_id: comment.id,
              reportable_type: 'comment'
          })
          success('Report submitted successfully')
          setShowOtherModal(false)
          setReportModalOpen(false)
          setOtherReason('')
      } catch (err) {
          error(err.message)
      }
  }

  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.author}</span>
          <span className="text-slate-500">{formatAge(comment.createdAt)}</span>
        </div>

        {!editing ? (
          <p className="mt-1 text-slate-700 whitespace-pre-wrap">{comment.text}</p>
        ) : (
          <div className="mt-2">
            <CommentComposer onSubmit={submitEdit} onCancel={() => setEditing(false)} submitLabel="Save" autoFocus placeholder="Edit your comment…" initialValue={comment.text} />
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 text-sm text-slate-600 relative">
          <button className="hover:underline" onClick={() => setReplying(v => !v)}>Reply</button>
          <button 
             className={`inline-flex items-center gap-1 hover:text-primary-600 transition-colors ${comment.isLiked ? 'text-primary-600 font-semibold' : ''}`}
             onClick={() => onLike?.(comment.id)}
          >
            <Icon name="like" filled={comment.isLiked}/><span>{comment.likes}</span>
          </button>
          
          <button className="hover:underline ml-2 text-slate-400 text-xs" onClick={() => setReportModalOpen(true)}>Report</button>

          <div className="flex-1" />
          {currentUser?.id == comment.userId && (
          <>
            <button className="p-1.5 rounded hover:bg-slate-100" title="Edit" onClick={() => setEditing(true)}><Icon name="edit"/></button>
            <button className="p-1.5 rounded hover:bg-slate-100" title="Delete" onClick={() => onDelete?.(comment.id)}><Icon name="trash"/></button>
          </>
          )}
        </div>
        
        {/* Report Modal - Quick inline for now */}
        {reportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                    <h3 className="text-lg font-bold mb-4">Report Comment</h3>
                    <div className="space-y-2">
                        {['Hate Speech', 'Spam', 'Harassment', 'Misinformation'].map(r => (
                            <button key={r} onClick={() => handleReport(r)} className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded border border-slate-200">
                                {r}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setReportModalOpen(false)} className="mt-4 w-full py-2 text-slate-500 hover:text-slate-800">Cancel</button>
                </div>
            </div>
        )}

        {replying && (
          <div className="mt-3">
             <CommentComposer onSubmit={submitReply} autoFocus placeholder={`Reply to ${comment.author}...`} />
          </div>
        )}
        
        {comment.replies?.length > 0 && (
          <div className="mt-4 space-y-4 pl-6 border-l border-slate-200">
            {comment.replies.map(r => (
              <CommentItem key={r.id} comment={r} currentUser={currentUser} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Icon({ name, filled = false }){
  const common = { className: 'w-4 h-4 text-slate-600' }
  switch(name){
    case 'edit': return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>)
    case 'trash': return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...common}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>)
    case 'like': return (<svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "w-4 h-4 text-primary-600" : "w-4 h-4 text-slate-600"}><path d="M7 10v12"/><path d="M15 22H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3l2-5 4 2v4h3a2 2 0 0 1 2 2l-1 5a2 2 0 0 1-2 2h-4Z"/></svg>)
    default: return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...common}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>)
  }
}

function formatAge(d){
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.max(1, Math.round(diff/60000))
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins/60)
  if (hrs < 24) return `${hrs} hour${hrs>1?'s':''} ago`
  const days = Math.round(hrs/24)
  return `${days} day${days>1?'s':''} ago`
}