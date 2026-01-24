import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Spinner from './Spinner.jsx'

export default function ProtectedAdmin({ children }){
  const { user, loading } = useAuth()
  
  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Spinner />
        </div>
      )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
