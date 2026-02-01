import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getUnreadCount, getNotifications, markNotificationRead } from '../lib/api.js';

export default function Header({ unreadCount: propUnread, setUnreadCount: propSetUnread, notifications: propNotifs, setNotifications: propSetNotifs, refreshKey, onMenuClick, sidebarOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  // Check if current page is login or signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  // Local state for independent usage (GuestLayout)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  
  // Use props if provided, otherwise local (though for guest these are usually empty)
  const finalUnread = propUnread !== undefined ? propUnread : unreadCount
  const finalNotifs = propNotifs !== undefined ? propNotifs : notifications
  const setFinalNotifs = propSetNotifs || setNotifications

  const displayNotifications = [
    ...(finalUnread > 0 ? [{ id: 'msg-1', text: `You have ${finalUnread} unread messages`, sub: 'Check your inbox now', type: 'message' }] : []),
    ...finalNotifs
  ]

  const handleMarkRead = async (id) => {
    if (id === 'msg-1') {
        navigate('/messages')
        return
    }
    try {
        await markNotificationRead(id)
        if (setFinalNotifs) {
             setFinalNotifs(prev => prev.filter(n => n.id !== id))
        }
    } catch(e) { console.error(e) }
  }

  const markAllRead = async () => {
    console.log('=== MARK ALL READ DEBUG ===')
    console.log('Final notifications:', finalNotifs)
    console.log('Final unread count:', finalUnread)
    
    // Mark all notifications as read
    const ids = finalNotifs.map(n => n.id)
    console.log('Notification IDs to mark as read:', ids)
    if (setFinalNotifs) setFinalNotifs([])
    for (const id of ids) {
        await markNotificationRead(id).catch(console.error)
    }
    
    // Since we can't mark all messages as read via API, manually set unread count to 0
    // The backend will correct this if needed on the next refresh
    if (propUnread !== undefined && propSetUnread) {
      console.log('Manually setting unread count to 0')
      propSetUnread(0)
      
      // Store the current count so we can detect when new messages arrive
      localStorage.setItem('messages_marked_all_read', Date.now().toString())
      localStorage.setItem('messages_marked_all_read_count', propUnread.toString())
    }
    
    // Trigger a refresh of the unread count (this will update from the backend)
    if (refreshKey) {
        console.log('Triggering header refresh...')
        // This will trigger the useEffect in AppLayout to refresh unread count
        window.dispatchEvent(new CustomEvent('refresh-header'))
    }
    console.log('=== END MARK ALL READ DEBUG ===')
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
      if (instructorDropdownRef.current && !instructorDropdownRef.current.contains(event.target)) {
        setIsInstructorDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
       console.error("Logout failed", error);
    }
  }

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      // Default navigation based on user role
      if (user?.role === 'admin') {
        navigate('/admin/reports')
      } else {
        navigate('/courses')
      }
      return
    }

    const query = encodeURIComponent(searchQuery.trim())
    
    if (user?.role === 'admin') {
      // Admin searches reports
      navigate(`/admin/reports?search=${query}`)
    } else {
      // Students and instructors search courses
      navigate(`/courses?search=${query}`)
    }
  }

  const isInstructor = user?.role === 'instructor'
  const isStudentDashboard = user?.role === 'student' && location.pathname === '/dashboard'

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {user && !isAuthPage && (
            <button
              type="button"
              onClick={onMenuClick}
              className="md:hidden -ml-2 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Open menu"
              aria-expanded={!!sidebarOpen}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
          )}
           {/* Left Logos */}
           <div className="flex items-center gap-2">
             <Link to="/">
               <img src="/assets/actacademy.png" alt="ACT Academy" className="h-10 w-auto object-contain" />
             </Link>
           </div>

           {/* <span className={`text-slate-700 font-semibold cursor-pointer hover:text-primary-600 ${isAuthPage ? 'hidden' : 'hidden md:block'}`}>Categories</span> */}

           {/* Search Bar */}
           <div className={`${isAuthPage ? 'hidden' : 'hidden md:flex'} items-center gap-2 bg-secondary rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/50`}>
            <SearchIcon className="w-4 h-4 text-muted-foreground" />
            <input 
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground text-foreground"  
              placeholder={user?.role === 'admin' ? 'Search reports...' : 'Search courses...'}  
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   handleSearch(e.target.value)
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Right Logos */}
          <div className="flex items-center gap-4 hidden lg:flex">
             <img src="/assets/mesrat.png" alt="Mesirat" className="h-8 w-auto object-contain" />
             <div className="flex items-center">
                 <span className="text-xl font-bold text-blue-400">ACT</span>
                 <span className="text-xl font-bold ml-1 text-foreground flex items-center">J<span className="text-blue-500">🔍</span>bs</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-border">
          {!user ? (
             <div className="flex items-center gap-3">
                 <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                   Log In
                 </Link>
                 <Link to="/signup" className="text-sm font-bold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                    Sign Up
                 </Link>
             </div>
          ) : (
          <>
          {isInstructor && (
            <Link to="/instructor/quizzes/new" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary-600 border border-primary/20 hover:bg-primary/20 text-sm font-medium transition-colors">Create Quiz</Link>
          )}

          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-accent text-foreground' : 'hover:bg-accent text-muted-foreground'}`}  
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {displayNotifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                    <span className="font-semibold text-foreground text-sm">Notifications</span>
                    {displayNotifications.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-600 font-medium hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {displayNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                      displayNotifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-accent cursor-pointer border-b border-border last:border-0" onClick={() => handleMarkRead(n.id)}>
                          <p className={`text-sm font-medium ${n.type === 'warning' ? 'text-red-600' : 'text-foreground'}`}>
                             {n.type === 'warning' && <span className="mr-1">⚠️</span>}
                             {n.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.sub}</p>
                        </div>
                      ))
                    )}
                  </div>
              </div>
            )}
          </div>
           {/* Contact Instructor dropdown removed from student dashboard header */}
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white font-semibold block transition-transform active:scale-95 uppercase"
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/messages" 
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left cursor-pointer block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          </>
          )}

        </div>
      </div>
      </div>
    </header>
  )
}

function SearchIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-3.6-3.6"/></svg>)}
function BellIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>)}

