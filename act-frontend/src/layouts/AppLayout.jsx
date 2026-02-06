// Cache bust: 2026-01-26-13-53-footer-fix
import { useRef, useEffect, useState, createContext, useContext } from 'react';
// Cache bust: 2026-01-26-13-35-fix-cogicon
import { useNavigate, Link, NavLink } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getUnreadCount, getNotifications, markNotificationRead } from '../lib/api.js';
import { ToastProvider } from '../components/Toast.jsx';

// Create context for header refresh
const HeaderRefreshContext = createContext()

export function useHeaderRefresh() {
  return useContext(HeaderRefreshContext)
}

export default function AppLayout({ children, hideMobileFooter = false }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [headerRefreshKey, setHeaderRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const firstLoad = useRef(true)
  const { user } = useAuth()

  // Function to refresh header data (e.g., after enrollment)
  const refreshHeader = () => {
    setHeaderRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    if (!user) return

    const fetchUpdates = async () => {
       try {
          // Check if user has marked all messages as read (persistent until new messages arrive)
          const markedAllRead = localStorage.getItem('messages_marked_all_read')
          const markedAllReadCount = localStorage.getItem('messages_marked_all_read_count')
          const manualAdjustment = localStorage.getItem('manual_unread_adjustment')
          const currentUnread = localStorage.getItem('current_unread_count')
          
          // Fetch Messages Count
          const { count } = await getUnreadCount()
          setUnreadCount(prev => {
             let finalCount = count
             
             // If there's a manual adjustment, use the stored count instead of backend
             if (manualAdjustment && currentUnread) {
               const timeSinceAdjustment = Date.now() - parseInt(manualAdjustment)
               // Use manual count for 10 minutes, then revert to backend
               if (timeSinceAdjustment < 600000) { // 10 minutes
                 console.log('Using manual unread count adjustment:', currentUnread)
                 finalCount = parseInt(currentUnread)
               } else {
                 // Clear manual adjustment after 10 minutes
                 localStorage.removeItem('manual_unread_adjustment')
                 localStorage.removeItem('current_unread_count')
               }
             }
             
             // Don't notify on initial load
             if (firstLoad.current) {
                firstLoad.current = false
                // If user marked all as read before, keep showing 0 until new messages arrive
                if (markedAllRead && markedAllReadCount && finalCount <= parseInt(markedAllReadCount)) {
                  console.log('Keeping unread count at 0 - user marked all as read and no new messages')
                  return 0
                }
                return finalCount
             }
             
             // If user marked all as read and count hasn't increased, keep at 0
             if (markedAllRead && markedAllReadCount && finalCount <= parseInt(markedAllReadCount)) {
               console.log('Keeping unread count at 0 - no new messages since mark all read')
               return 0
             }
             
             // New messages arrived since mark all read, clear the flag and show new count
             if (markedAllRead && finalCount > parseInt(markedAllReadCount)) {
               console.log('New messages arrived, clearing mark all read flag')
               localStorage.removeItem('messages_marked_all_read')
               localStorage.removeItem('messages_marked_all_read_count')
             }
             
             // Notify if count increased
             if (finalCount > prev && prev > 0) {
                // Show notification for new messages
                new Notification(`New Messages`, {
                   body: `You have ${finalCount} unread message${finalCount > 1 ? 's' : ''}`,
                   icon: '/favicon.ico'
                })
             }
             return finalCount
          })

          // Fetch Notifications
          const notifs = await getNotifications()
          // Format backend notifications to match UI
          const formatted = notifs.filter(n => !n.read_at).map(n => ({
            id: n.id,
            text: n.data.message || 'New notification',
            sub: new Date(n.created_at).toLocaleString(),
            type: n.data.type, // 'warning', etc
            data: n.data
          }))
          setNotifications(formatted)
       } catch (e) {
          // silent error
       }
    }
    
    fetchUpdates()
    const interval = setInterval(fetchUpdates, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [user])

  return (
    <ToastProvider>
      <HeaderRefreshContext.Provider value={refreshHeader}>
        <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
          <Header 
            unreadCount={unreadCount} 
            setUnreadCount={setUnreadCount}
            notifications={notifications} 
            setNotifications={setNotifications}
            refreshKey={headerRefreshKey}
            onMenuClick={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
          />

          {user && (
            <>
              {/* Mobile sidebar overlay */}
              <div
                className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 bg-black/40 md:hidden`}
                onClick={() => setSidebarOpen(false)}
              />

              {/* Mobile sidebar drawer */}
              <div
                className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-sidebar border-r border-slate-200 dark:border-sidebar-border md:hidden transition-transform duration-200 ease-out flex flex-col`}
                role="dialog"
                aria-modal="true"
              >
                <div className="h-16 px-4 border-b border-slate-200 dark:border-sidebar-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-accent text-slate-700 dark:text-foreground"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                  <MobileNav unreadCount={unreadCount} user={user} onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            </>
          )}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6 w-full flex-1 items-start">
            <Sidebar unreadCount={unreadCount} user={user} />
            <div className="flex-1 min-w-0 flex flex-col w-full">
              <main className="flex-1">{children}</main>
            </div>
          </div>
          <div className={`${hideMobileFooter ? 'hidden md:block' : 'block'}`}>
             <Footer />
          </div>
        </div>
      </HeaderRefreshContext.Provider>
    </ToastProvider>
  )
}


function Sidebar({ unreadCount, user }) {
  const linkClass = ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-white dark:bg-sidebar-accent shadow-soft text-slate-900 dark:text-sidebar-accent-foreground' : 'text-slate-600 dark:text-muted-foreground hover:bg-white dark:hover:bg-sidebar-accent'}`

  const MessagesLink = () => (
      <NavLink to="/messages" className={linkClass}>
          <ChatIcon className="w-5 h-5"/>
          <span className="flex-1">Messages</span>
          {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
              </span>
          )}
      </NavLink>
  )
  
  if (user?.role === 'admin') {
    return (
      <aside className="hidden md:block w-60 shrink-0 space-y-2 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-4 custom-scrollbar self-start">
        <NavLink to="/admin/dashboard" className={linkClass}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
        <NavLink to="/admin/reports" className={linkClass}><AlertIcon className="w-5 h-5"/>Reports</NavLink>
        <NavLink to="/admin/instructors" className={linkClass}><UsersIcon className="w-5 h-5"/>Manage Instructors</NavLink>
        <NavLink to="/settings" className={linkClass}><GearIcon className="w-5 h-5"/>Settings</NavLink>
      </aside>
    )
  }

  if (user?.role === 'instructor') {
    return (
      <aside className="hidden md:block w-60 shrink-0 space-y-2 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-4 custom-scrollbar self-start">
        <NavLink to="/instructor/dashboard" className={linkClass}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
        <NavLink to="/instructor/quizzes" end className={linkClass}><BookIcon className="w-5 h-5"/>My Quizzes</NavLink>
        <NavLink to="/instructor/quizzes/new" className={linkClass}><ChartIcon className="w-5 h-5"/>Create Quiz</NavLink>
        <MessagesLink />
        <NavLink to="/settings" className={linkClass}><GearIcon className="w-5 h-5"/>Settings</NavLink>
      </aside>
    )
  }

  return (
    <aside className="hidden md:block w-60 shrink-0 space-y-2 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-4 custom-scrollbar self-start">
      <NavLink to="/dashboard" className={linkClass}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
      <NavLink to="/courses" className={linkClass}><BookIcon className="w-5 h-5"/>Courses</NavLink>
      <NavLink to="/results" className={linkClass}><ChartIcon className="w-5 h-5"/>Results</NavLink>
      <MessagesLink />
      <NavLink to="/settings" className={linkClass}><GearIcon className="w-5 h-5"/>Settings</NavLink>
    </aside>
  )
}

function MobileNav({ unreadCount, user, onNavigate }) {
  const linkClass = ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-slate-50 dark:bg-accent text-slate-900 dark:text-accent-foreground' : 'text-slate-700 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-accent'}`

  const MessagesLink = () => (
    <NavLink to="/messages" className={linkClass} onClick={onNavigate}>
      <ChatIcon className="w-5 h-5"/>
      <span className="flex-1">Messages</span>
      {unreadCount > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </NavLink>
  )

  if (user?.role === 'admin') {
    return (
      <nav className="space-y-2">
        <NavLink to="/admin/dashboard" className={linkClass} onClick={onNavigate}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
        <NavLink to="/admin/reports" className={linkClass} onClick={onNavigate}><AlertIcon className="w-5 h-5"/>Reports</NavLink>
        <NavLink to="/admin/instructors" className={linkClass} onClick={onNavigate}><UsersIcon className="w-5 h-5"/>Manage Instructors</NavLink>
        <MessagesLink />
        <NavLink to="/settings" className={linkClass} onClick={onNavigate}><GearIcon className="w-5 h-5"/>Settings</NavLink>
      </nav>
    )
  }

  if (user?.role === 'instructor') {
    return (
      <nav className="space-y-2">
        <NavLink to="/instructor/dashboard" className={linkClass} onClick={onNavigate}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
        <NavLink to="/instructor/quizzes" end className={linkClass} onClick={onNavigate}><BookIcon className="w-5 h-5"/>My Quizzes</NavLink>
        <NavLink to="/instructor/quizzes/new" className={linkClass} onClick={onNavigate}><ChartIcon className="w-5 h-5"/>Create Quiz</NavLink>
        <MessagesLink />
        <NavLink to="/settings" className={linkClass} onClick={onNavigate}><GearIcon className="w-5 h-5"/>Settings</NavLink>
      </nav>
    )
  }

  return (
    <nav className="space-y-2">
      <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}><HomeIcon className="w-5 h-5"/>Dashboard</NavLink>
      <NavLink to="/courses" className={linkClass} onClick={onNavigate}><BookIcon className="w-5 h-5"/>Courses</NavLink>
      <NavLink to="/results" className={linkClass} onClick={onNavigate}><ChartIcon className="w-5 h-5"/>Results</NavLink>
      <MessagesLink />
      <NavLink to="/settings" className={linkClass} onClick={onNavigate}><GearIcon className="w-5 h-5"/>Settings</NavLink>
    </nav>
  )
}

function SearchIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-3.6-3.6"/></svg>)}
function BellIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>)}
function HomeIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7"/><path d="M9 22V12h6v10"/></svg>)}
function BookIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v16.5"/><path d="M20 22V6H6.5A2.5 2.5 0 0 0 4 8.5"/></svg>)}
function ChatIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>)}
function ChartIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="12" width="4" height="8"/><rect x="10" y="9" width="4" height="11"/><rect x="17" y="5" width="4" height="15"/></svg>)}
function GearIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51.55.23 1.18.1 1.62-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.44-.56 1.07-.33 1.62.25.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1Z"/></svg>)}
function UsersIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>)}
function AlertIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>)}

