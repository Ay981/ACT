import AppLayout from '../layouts/AppLayout.jsx'
import { useState, useEffect } from 'react'
import { getAdminReports, resolveReport } from '../lib/api'
import AdminModal from '../components/AdminModal.jsx'

export default function AdminReports(){
  const [filter, setFilter] = useState('All') // Filter currently only client-side since API returns all pending
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmation, setConfirmation] = useState({ isOpen: false, id: null, action: null })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
        const data = await getAdminReports()
        setReports(data)
    } catch (e) {
        console.error("Failed to load reports", e)
    } finally {
        setLoading(false)
    }
  }

  const promptAction = (id, action) => {
      setConfirmation({ isOpen: true, id, action })
  }

  const confirmAction = async () => {
    const { id, action } = confirmation
    if(!id || !action) return;

    try {
        await resolveReport(id, action)
        setReports(prev => prev.filter(r => r.id !== id))
        setConfirmation({ isOpen: false, id: null, action: null })
    } catch (e) {
        alert('Failed to process action')
        setConfirmation({ isOpen: false, id: null, action: null })
    }
  }

  const getActionLabel = (action) => {
      switch(action){
          case 'dismiss': return 'Dismiss Report';
          case 'warn': return 'Warn User';
          case 'restrict': return 'Restrict User (7 days)';
          case 'ban': return 'Ban User';
          case 'delete_content': return 'Delete Content';
          default: return action;
      }
  }

  // The backend currently only returns 'pending' reports. 
  // If we want history, we'd need to update the controller.
  const filteredReports = reports 

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Issues</h1>
            <p className="text-slate-500">Manage user reports and platform issues.</p>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Report Details</th>
                        <th className="px-6 py-4">Users</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                     {loading ? (
                         <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading reports...</td></tr>
                     ) : filteredReports.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No pending reports found.</td></tr>
                     ) : filteredReports.map(r => (
                         <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700`}>
                                    {r.status}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="font-semibold text-slate-900">{r.reason}</div>
                                 <div className="text-slate-500 text-xs mt-1">
                                     Type: {r.reportable_type?.split('\\').pop()}
                                     {/* Show snippet if available */}
                                     {r.reportable ? 
                                        <div className="italic mt-1 border-l-2 border-slate-300 pl-2">
                                            "{r.reportable.content || r.reportable.message}"
                                        </div> 
                                     : null}
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-slate-600">
                                <div className="text-xs">
                                    <span className="font-bold text-red-600">Reported:</span> {r.reportedUser?.name || 'Unknown'}
                                </div>
                                <div className="text-xs mt-1">
                                    <span className="font-bold text-slate-500">By:</span> {r.reporter?.name || 'Unknown'}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                             <td className="px-6 py-4 text-right space-x-2">
                                 <button onClick={() => promptAction(r.id, 'dismiss')} className="text-slate-500 hover:text-slate-700 text-xs font-medium">Dismiss</button>
                                 <button onClick={() => promptAction(r.id, 'warn')} className="text-amber-600 hover:text-amber-700 text-xs font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200">Warn</button>
                                 <button onClick={() => promptAction(r.id, 'restrict')} className="text-orange-600 hover:text-orange-700 text-xs font-medium bg-orange-50 px-2 py-1 rounded border border-orange-200">Restrict (7d)</button>
                                 <button onClick={() => promptAction(r.id, 'ban')} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-2 py-1 rounded border border-red-200">Ban</button>
                                 <button onClick={() => promptAction(r.id, 'delete_content')} className="text-rose-600 hover:text-rose-700 text-xs font-medium bg-rose-50 px-2 py-1 rounded border border-rose-200">Delete Content</button>
                             </td>
                         </tr>
                     ))}
                </tbody>
            </table>
        </div>

        <AdminModal 
            isOpen={confirmation.isOpen} 
            onClose={() => setConfirmation({ isOpen: false, id: null, action: null })}
            title={`Confirm ${getActionLabel(confirmation.action)}`}
        >
            <div className="space-y-4">
                <p className="text-slate-600">
                    Are you sure you want to {confirmation.action === 'delete_content' ? 'delete the reported content' : `perform "${getActionLabel(confirmation.action)}"`}?
                    {confirmation.action === 'delete_content' && " This cannot be undone."}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={() => setConfirmation({ isOpen: false, id: null, action: null })}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmAction}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm
                            ${['ban', 'delete_content'].includes(confirmation.action) ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                        `}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </AdminModal>
      </div>
    </AppLayout>
  )
}
