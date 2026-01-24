const KEY = 'authState'

export function getAuth(){
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { isAuthenticated: false }
  } catch {
    return { isAuthenticated: false }
  }
}

export function setAuthenticated(isAuthenticated){
  try { localStorage.setItem(KEY, JSON.stringify({ isAuthenticated })) } catch {}
}

export function logout(){
  try { localStorage.removeItem(KEY) } catch {}
}
