import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function SmartDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard')
        break
      case 'instructor':
        navigate('/instructor/dashboard')
        break
      case 'student':
      default:
        navigate('/student-dashboard')
        break
    }
  }, [user, navigate])

  // Show loading while redirecting
  return (
   null
  )
}
