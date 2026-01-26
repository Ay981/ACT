import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { submitReport } from '../../lib/api'
import { useToast } from '../Toast.jsx'

export default function MessageThread({ conversation, onSend }){
  const { user } = useAuth()
  
  if (!conversation) return (
    <div className="h-full grid place-items-center text-slate-600">Select a conversation</div>
  )

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold">{conversation.title}</h3>
        <p className="text-sm text-slate-600">{conversation.participant}</p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {conversation.messages.map(msg => (
          <Bubble key={msg.id} message={msg} align={msg.sender_id === user?.id ? 'right' : 'left'} />
        ))}
      </div>
      <footer>
        {/* Composer injected by parent to allow state control */}
      </footer>
    </div>
  )
}

function Bubble({ message, align }){
  const [showReport, setShowReport] = useState(false)
  const [showOtherModal, setShowOtherModal] = useState(false)
  const [otherReason, setOtherReason] = useState('')
  const { success, error } = useToast()
  const isRight = align==='right'
  
  const handleReport = async (reason) => {
      if (reason === 'Other') {
          setShowOtherModal(true)
          return
      }
      
      try {
          await submitReport({
              reason,
              reportable_id: message.id,
              reportable_type: 'message'
          })
          success('Report submitted successfully')
          setShowReport(false)
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
              reportable_id: message.id,
              reportable_type: 'message'
          })
          success('Report submitted successfully')
          setShowOtherModal(false)
          setShowReport(false)
          setOtherReason('')
      } catch (err) {
          error(err.message)
      }
  }

  return (
    <>
    <div className={`flex items-end gap-2 ${isRight?'justify-end':'justify-start'}`}>
      {!isRight && (
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setShowReport(true)}
            className="p-1.5 text-slate-500 hover:text-red-500 transition-colors text-xs"
            title="Report Message"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
        </div>
      )}
      
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isRight?'bg-primary-600 text-white':'bg-white border border-slate-200'}`}>
        {message.text}
      </div>
    </div>

    <AdminModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        title="Report Message"
    >
        <div className="space-y-3">
             <p className="text-sm text-slate-600">Why are you reporting this message?</p>
             {['Harassment', 'Spam', 'Inappropriate Content', 'Other'].map(reason => (
                 <button 
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium text-slate-700"
                 >
                     {reason}
                 </button>
             ))}
             <button onClick={() => setShowReport(false)} className="w-full mt-2 text-center text-sm text-slate-500 hover:text-slate-800">
                 Cancel
             </button>
        </div>
    </AdminModal>

    {/* Other Reason Modal */}
    {showOtherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                <h3 className="text-lg font-bold mb-4">Specify Reason</h3>
                <p className="text-sm text-slate-600 mb-4">Please provide details about why you're reporting this message:</p>
                <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    autoFocus
                />
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={() => {
                            setShowOtherModal(false)
                            setOtherReason('')
                        }}
                        className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleOtherReasonSubmit}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  )
}
