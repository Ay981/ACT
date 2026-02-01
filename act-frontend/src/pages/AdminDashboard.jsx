import AppLayout from '../layouts/AppLayout.jsx'
import StatCard from '../components/StatCard.jsx'
import AdminModal from '../components/AdminModal.jsx'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAdminDashboardStats, sendBroadcast, getMaintenanceStatus, toggleMaintenance } from '../lib/api.js'

export default function AdminDashboard(){
  const [activeModal, setActiveModal] = useState(null) // 'broadcast', 'addInstructor', 'maintenance'
  
  // Data States
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
      total_users: { value: 0, delta: '...' },
      active_instructors: { value: 0, delta: '...' },
      pending_reports: { value: 0, delta: '...', status: 'success' },
      system_health: { value: '100%', status: 'success' }
  })
  const [recentReports, setRecentReports] = useState([])
  const [notifications, setNotifications] = useState([]) // Placeholder for now

  useEffect(() => {
    async function loadData() {
        try {
            const [data, maintData] = await Promise.all([
                getAdminDashboardStats(),
                getMaintenanceStatus()
            ])
            setStats(data.stats)
            setRecentReports(data.recent_reports)
            setMaintenance(maintData.enabled)
            // For now, notifications are still client-side only or empty until we have a real notification system for admins
            setNotifications([]) 
        } catch (e) {
            console.error("Failed to load admin stats", e)
        } finally {
            setLoading(false)
        }
    }
    loadData()
  }, [])

  // Form States
  const [broadcast, setBroadcast] = useState({ target: 'all', message: '' })
  const [newInstructor, setNewInstructor] = useState({ name: '', email: '' })
  const [maintenance, setMaintenance] = useState(false)

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcast.message) return
    
    try {
        await sendBroadcast(broadcast.message, broadcast.target)
        alert(`Message sent successfully to ${broadcast.target === 'all' ? 'everyone' : broadcast.target}`)
        setActiveModal(null)
        setBroadcast({ target: 'all', message: '' })
    } catch (e) {
        alert('Failed to send broadcast: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleAddInstructor = (e) => {
    e.preventDefault()
    alert(`Invitation sent to instructor: ${newInstructor.name} (${newInstructor.email})`)
    setActiveModal(null)
    setNewInstructor({ name: '', email: '' })
  }

  const handleMarkAllRead = () => {
      setNotifications([])
  }

  const handleToggleMaintenance = async () => {
      try {
          const newState = !maintenance
          await toggleMaintenance(newState)
          setMaintenance(newState)
      } catch (e) {
          console.error(e)
          alert('Failed to update maintenance mode')
      }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
            <div className="text-sm text-muted-foreground">Last updated: Just now</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard label="Total Users" value={stats.total_users.value} delta={stats.total_users.delta} />
             <StatCard label="Active Instructors" value={stats.active_instructors.value} delta={stats.active_instructors.delta} />
             <StatCard label="Pending Reports" value={stats.pending_reports.value} delta={stats.pending_reports.delta} status={stats.pending_reports.status} />
             <StatCard label="System Health" value={stats.system_health.value} status={stats.system_health.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Notifications & Activity */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg text-foreground">System Notifications</h2>
                        <button onClick={handleMarkAllRead} className="text-sm text-primary-600 font-medium hover:underline">Mark all read</button>
                    </div>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <span className="text-3xl block mb-2">🎉</span>
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                            <div key={n.id} className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                                    n.type === 'error' ? 'bg-red-500' : 
                                    n.type === 'warning' ? 'bg-amber-500' : 
                                    n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                                <div>
                                    <div className="font-medium text-foreground">{n.title}</div>
                                    <div className="text-sm text-muted-foreground">{n.desc}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg text-foreground">Recent User Reports</h2>
                        <Link to="/admin/reports" className="text-sm text-primary-600 font-medium hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
                            <tr>
                                <th className="px-3 py-2">Report ID</th>
                                <th className="px-3 py-2">Subject</th>
                                <th className="px-3 py-2">Reporter</th>
                                <th className="px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                             {recentReports.length > 0 ? recentReports.map(r => (
                                 <tr key={r.id}>
                                     <td className="px-3 py-3 font-medium text-foreground">{r.id}</td>
                                     <td className="px-3 py-3 text-muted-foreground">{r.subject}</td>
                                     <td className="px-3 py-3 text-muted-foreground">{r.reporter}</td>
                                     <td className="px-3 py-3">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                                             r.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                             r.status === 'Resolved' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                         }`}>
                                             {r.status}
                                         </span>
                                     </td>
                                 </tr>
                             )) : (
                                 <tr>
                                     <td colSpan="4" className="px-3 py-4 text-center text-muted-foreground">No recent reports</td>
                                 </tr>
                             )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-5">
                    <h2 className="font-semibold mb-4 text-foreground">Quick Actions</h2>
                    <div className="space-y-2">
                        <button onClick={() => setActiveModal('addInstructor')} className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground hover:text-primary-700 dark:hover:text-primary-400 transition-all font-medium text-sm flex items-center gap-2">
                             <span className="text-xl">🎓</span> Invite New Instructor
                        </button>
                        <button onClick={() => setActiveModal('broadcast')} className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground hover:text-primary-700 dark:hover:text-primary-400 transition-all font-medium text-sm flex items-center gap-2">
                             <span className="text-xl">📢</span> Broadcast Message
                        </button>
                        <button onClick={() => setActiveModal('maintenance')} className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground hover:text-primary-700 dark:hover:text-primary-400 transition-all font-medium text-sm flex items-center gap-2">
                             <span className="text-xl">⚙️</span> Maintenance Mode
                        </button>
                    </div>
                </div>

                 <div className="bg-indigo-600 rounded-2xl p-5 text-white">
                    <h2 className="font-bold text-lg mb-2">Admin Pro Tips</h2>
                    <p className="text-indigo-100 text-sm mb-4">
                        Review pending instructor applications within 24 hours to maintain engagement.
                    </p>
                    <button onClick={() => alert("Opening guidelines PDF...")} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-indigo-50 transition-colors">
                        Review Guidelines
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Modals */}
      {/* Broadcast Modal */}
      <AdminModal 
        isOpen={activeModal === 'broadcast'} 
        onClose={() => setActiveModal(null)}
        title="Broadcast Message"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Target Audience</label>
            <select 
              value={broadcast.target}
              onChange={(e) => setBroadcast({...broadcast, target: e.target.value})}
              className="w-full rounded-lg border-input bg-background text-foreground shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="student">Students Only</option>
              <option value="instructor">Instructors Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message Body</label>
            <textarea 
              value={broadcast.message}
              onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
              rows={4}
              className="w-full rounded-lg border-input bg-background text-foreground shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your announcement here..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-foreground hover:bg-muted rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Broadcast
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Add User Modal -> Converted to New Instructor */}
      <AdminModal 
        isOpen={activeModal === 'addInstructor'} 
        onClose={() => setActiveModal(null)}
        title="Invite New Instructor"
      >
        <form onSubmit={handleAddInstructor} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send an invitation email to a new instructor. They will receive a link to set up their account and profile.
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input 
              type="text"
              value={newInstructor.name}
              onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
              className="w-full rounded-lg border-input bg-background text-foreground shadow-sm focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input 
              type="email"
              value={newInstructor.email}
              onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
              className="w-full rounded-lg border-input bg-background text-foreground shadow-sm focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-foreground hover:bg-muted rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Maintenance Modal */}
      <AdminModal 
        isOpen={activeModal === 'maintenance'} 
        onClose={() => setActiveModal(null)}
        title="System Maintenance"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">Toggle maintenance mode to prevent non-admin users from accessing the platform. Use this during updates.</p>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-semibold text-foreground">Maintenance Mode</div>
              <div className="text-sm text-muted-foreground">{maintenance ? 'Active' : 'Inactive'}</div>
            </div>
            <button 
              onClick={handleToggleMaintenance}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${maintenance ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="pt-4 border-t border-border">
             <button onClick={() => alert("Cache cleared!")} className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium">
                Clear System Cache
             </button>
          </div>
        </div>
      </AdminModal>
    </AppLayout>
  )
}
