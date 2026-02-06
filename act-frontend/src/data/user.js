// Minimal user context

const KEY = 'learnsphere_user'
const LEGACY_KEY = 'act_user'

export function getCurrentUser(){
  try {
    let stored = localStorage.getItem(KEY)
    if (!stored) {
      stored = localStorage.getItem(LEGACY_KEY)
    }
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to parse user data', e)
  }

  // Fallback for non-logged-in or legacy state (defaults to student if unknown)
  return {
    id: 'guest',
    name: 'Guest User',
    email: '',
    role: 'student' 
  }
}

export function setUser(user){
  try { 
    localStorage.setItem(KEY, JSON.stringify(user)) 
  } catch {}
}

export function setUserRole(role){
    // Update only the role in the existing user object
    const user = getCurrentUser()
    user.role = role
    setUser(user)
}

export function isInstructor(){
  return getCurrentUser().role === 'instructor'
}

export function isAdmin(){
  return getCurrentUser().role === 'admin'
}
