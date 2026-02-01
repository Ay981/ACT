import AppLayout from '../layouts/AppLayout.jsx'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAdminReports, resolveReport } from '../lib/api'
import AdminModal from '../components/AdminModal.jsx'
// import { useToast } from '../components/Toast.jsx'

export default function AdminReports(){
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('All')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmation, setConfirmation] = useState({ isOpen: false, id: null, action: null })
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  // const { success, error } = useToast()

  useEffect(() => {
    loadReports()
  }, [])

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ search: searchQuery })
    } else {
      setSearchParams({})
    }
  }, [searchQuery, setSearchParams])

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
        // success('Report action completed successfully')
        console.log('Report action completed successfully')
    } catch (e) {
        // error('Failed to process action')
        console.error('Failed to process action')
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
  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      report.reason?.toLowerCase().includes(q) ||
      report.reportable_type?.toLowerCase().includes(q) ||
      report.reportedUser?.name?.toLowerCase().includes(q) ||
      report.reporter?.name?.toLowerCase().includes(q) ||
      report.reportable?.content?.toLowerCase().includes(q) ||
      report.reportable?.message?.toLowerCase().includes(q)
    )
  }) 

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports & Issues</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage user reports and platform issues.</p>
        </header>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, description, or users..."
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-xs border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Report Details</th>
                        <th className="px-6 py-4">Users</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                     {loading ? (
                         <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading reports...</td></tr>
                     ) : filteredReports.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No pending reports found.</td></tr>
                     ) : filteredReports.map(r => (
                         <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                             <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}>
                                    {r.status}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                 <div className="font-semibold text-slate-900 dark:text-slate-100">{r.reason}</div>
                                 <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                     Type: {r.reportable_type?.split('\\').pop()}
                                     {/* Show snippet if available */}
                                     {r.reportable ? 
                                        <div className="italic mt-1 border-l-2 border-slate-300 dark:border-slate-600 pl-2 text-slate-600 dark:text-slate-300">
                                            "{r.reportable.content || r.reportable.message}"
                                        </div> 
                                     : null}
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                <div className="text-xs">
                                    <span className="font-bold text-red-600 dark:text-red-400">Reported:</span> {r.reportedUser?.name || 'Unknown'}
                                </div>
                                <div className="text-xs mt-1">
                                    <span className="font-bold text-slate-500 dark:text-slate-400">By:</span> {r.reporter?.name || 'Unknown'}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                             <td className="px-6 py-4 text-right">
                                 <button onClick={() => promptAction(r.id, 'dismiss')} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-medium">Dismiss</button>
                                 <button onClick={() => promptAction(r.id, 'warn')} className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-medium ml-2">Warn</button>
                                 <button onClick={() => promptAction(r.id, 'ban')} className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium ml-2">Ban</button>
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
                <p className="text-slate-600 dark:text-slate-300">
                    Are you sure you want to {confirmation.action === 'delete_content' ? 'delete the reported content' : `perform "${getActionLabel(confirmation.action)}"`}?
                    {confirmation.action === 'delete_content' && " This cannot be undone."}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={() => setConfirmation({ isOpen: false, id: null, action: null })}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
