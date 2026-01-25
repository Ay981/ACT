import { createContext, useContext, useState, useEffect } from 'react'
import { getUser, login as apiLogin, logout as apiLogout, register as apiRegister, verifyOtp } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
      try {
          const u = await getUser()
          if (u && typeof u === 'object' && u.id) {
              setUser(u)
              return u
          }
          throw new Error('Invalid user data received')
      } catch (e) {
          setUser(null)
          return null
      }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  const login = async (creds) => {
    await apiLogin(creds)
    return refreshUser()
  }

  const logout = async () => {
    try {
        await apiLogout()
    } catch(e) {
        console.warn("Logout failed", e)
    }
    setUser(null)
  }

  const register = async (data) => {
      await apiRegister(data)
      return refreshUser()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
