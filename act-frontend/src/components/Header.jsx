import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getUnreadCount, getNotifications, markNotificationRead, getEnrolledCourses, getAdminInstructors, markAllMessagesAsRead } from '../lib/api.js';

export default function Header({ unreadCount: propUnread, notifications: propNotifs, setNotifications: propSetNotifs, refreshKey }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)
  const instructorDropdownRef = useRef(null)

  // Check if current page is login or signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  // Local state for independent usage (GuestLayout)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [allInstructors, setAllInstructors] = useState([])
  
  // Use props if provided, otherwise local (though for guest these are usually empty)
  const finalUnread = propUnread !== undefined ? propUnread : unreadCount
  const finalNotifs = propNotifs !== undefined ? propNotifs : notifications
  const setFinalNotifs = propSetNotifs || setNotifications

  // Load instructors for dropdown
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        // Students get instructors from their enrolled courses
        getEnrolledCourses().then(setEnrolledCourses).catch(console.error)
      } else if (user.role === 'admin') {
        // Admins get all instructors in the system
        getAdminInstructors().then(setAllInstructors).catch(console.error)
      }
    }
  }, [user, refreshKey])

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
    
    // Also mark all messages as read
    try {
        console.log('Calling markAllMessagesAsRead...')
        const response = await markAllMessagesAsRead()
        console.log('markAllMessagesAsRead response:', response)
        
        // Trigger a refresh of the unread count
        if (refreshKey) {
            console.log('Triggering header refresh...')
            // This will trigger the useEffect in AppLayout to refresh unread count
            window.dispatchEvent(new CustomEvent('refresh-header'))
        }
    } catch (err) {
        console.error('Failed to mark all messages as read:', err)
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

  // Get unique instructors from enrolled courses or all instructors for admin
  const getUniqueInstructors = () => {
    if (user?.role === 'admin') {
      // Admins see all instructors in the system
      return allInstructors
    } else {
      // Students get instructors from their enrolled courses
      const instructors = new Map()
      enrolledCourses.forEach(course => {
        if (course.instructor && !instructors.has(course.instructor.id)) {
          instructors.set(course.instructor.id, course.instructor)
        }
      })
      return Array.from(instructors.values())
    }
  }

  const uniqueInstructors = getUniqueInstructors()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
           {/* Left Logos */}
           <div className="flex items-center gap-2">
             <Link to="/">
               <img src="/assets/actacademy.png" alt="ACT Academy" className="h-10 w-auto object-contain" />
             </Link>
           </div>

           <span className={`text-slate-700 font-semibold cursor-pointer hover:text-primary-600 ${isAuthPage ? 'hidden' : 'hidden md:block'}`}>Categories</span>

           {/* Search Bar */}
           <div className={`${isAuthPage ? 'hidden' : 'hidden md:flex'} items-center gap-2 bg-slate-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary-100 transition-all border border-transparent focus-within:border-primary-200`}>
            <SearchIcon className="w-4 h-4 text-slate-500" />
            <input 
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400" 
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
                 <span className="text-xl font-bold ml-1 text-slate-800 flex items-center">J<span className="text-blue-500">🔍</span>bs</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          {!user ? (
             <div className="flex items-center gap-3">
                 <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1">
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
            <Link to="/instructor/quizzes/new" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 text-sm font-medium transition-colors">Create Quiz</Link>
          )}
          
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-100 text-slate-600'}`} 
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {displayNotifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    {displayNotifications.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-600 font-medium hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {displayNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            No new notifications
                        </div>
                    ) : (
                      displayNotifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0" onClick={() => handleMarkRead(n.id)}>
                          <p className={`text-sm font-medium ${n.type === 'warning' ? 'text-red-700' : 'text-slate-800'}`}>
                             {n.type === 'warning' && <span className="mr-1">⚠️</span>}
                             {n.text}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.sub}</p>
                        </div>
                      ))
                    )}
                  </div>
              </div>
            )}
          </div>
           {!isInstructor && (user?.role === 'student' || user?.role === 'admin') && (
             <div className="relative" ref={instructorDropdownRef}>
               <button 
                 onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)}
                 className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-sm"
               >
                 Contact Instructor
                 <svg className={`w-4 h-4 transition-transform ${isInstructorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                 </svg>
               </button>
               
               {isInstructorDropdownOpen && (
                 <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                   <div className="px-4 py-2 border-b border-slate-100">
                     <span className="font-semibold text-slate-900 text-sm">
                       {user?.role === 'admin' ? 'All Instructors' : 'Your Instructors'}
                     </span>
                   </div>
                   <div className="max-h-64 overflow-y-auto">
                     {uniqueInstructors.length === 0 ? (
                       <div className="px-4 py-4 text-center text-sm text-slate-500">
                         {user?.role === 'admin' ? 'No instructors found in system' : 'No instructors found'}
                       </div>
                     ) : (
                       uniqueInstructors.map(instructor => (
                         <div 
                           key={instructor.id}
                           onClick={() => {
                             navigate(`/messages?instructor=${instructor.id}`)
                             setIsInstructorDropdownOpen(false)
                           }}
                           className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white font-semibold text-xs flex items-center justify-center uppercase">
                               {instructor.name?.charAt(0) || 'I'}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-slate-800 truncate">{instructor.name}</p>
                               <p className="text-xs text-slate-500 truncate">{instructor.email}</p>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                   <div className="px-4 py-2 border-t border-slate-100">
                     <Link 
                       to="/messages"
                       onClick={() => setIsInstructorDropdownOpen(false)}
                       className="text-xs text-primary-600 font-medium hover:underline"
                     >
                       View All Messages →
                     </Link>
                   </div>
                 </div>
               )}
             </div>
           )}
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white font-semibold block transition-transform active:scale-95 uppercase"
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/messages" 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left cursor-pointer block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

