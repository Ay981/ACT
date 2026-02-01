import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'

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
    <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
      <Spinner />
    </div>
  )
}
