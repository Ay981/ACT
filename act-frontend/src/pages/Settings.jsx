import AppLayout from '../layouts/AppLayout.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useState, useEffect } from 'react'
import { updateProfile, updatePassword } from '../lib/api.js'

export default function Settings() {
  const { user, setUser: setAuthUser } = useAuth()
  const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || ''
  })
  
  const isInst = user?.role === 'instructor'
  const [status, setStatus] = useState(null) // success or error message
  
  // Password Form State
  const [passData, setPassData] = useState({
      current_password: '',
      password: '',
      password_confirmation: ''
  })

  useEffect(() => {
    if (user) {
        setFormData({ name: user.name, email: user.email })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
      e.preventDefault()
      setStatus(null)
      try {
          const res = await updateProfile(formData)
          const updatedUser = res.user || res
          setAuthUser(updatedUser)
          setStatus({ type: 'success', message: 'Profile updated successfully.' })
      } catch (err) {
          setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' })
      }
  }

  const handlePasswordUpdate = async (e) => {
      e.preventDefault()
      setStatus(null)
      try {
          await updatePassword(passData)
          setPassData({ current_password: '', password: '', password_confirmation: '' }) // clear form
          setStatus({ type: 'success', message: 'Password changed successfully.' })
      } catch (err) {
          setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password.' })
      }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {status && (
            <div className={`p-4 rounded-xl ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {status.message}
            </div>
        )}

        <form onSubmit={handleProfileUpdate} className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
               <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl bg-background border-input focus:border-primary-500 focus:ring-primary-500 text-foreground" 
                  required
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground mb-1">Email</label>
               <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl bg-background border-input focus:border-primary-500 focus:ring-primary-500 text-foreground" 
                  required
               />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-sm">Save Profile</button>
          </div>
        </form>

        <form onSubmit={handlePasswordUpdate} className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Update Password</h2>
          <div className="space-y-4 max-w-md">
             <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                <input 
                    type="password" 
                    value={passData.current_password}
                    onChange={e => setPassData({...passData, current_password: e.target.value})}
                    className="w-full rounded-2xl bg-background border-input focus:border-primary-500 focus:ring-primary-500 text-foreground" 
                    required
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input 
                    type="password" 
                    value={passData.password}
                    onChange={e => setPassData({...passData, password: e.target.value})}
                    className="w-full rounded-2xl bg-background border-input focus:border-primary-500 focus:ring-primary-500 text-foreground" 
                    required
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                <input 
                    type="password" 
                    value={passData.password_confirmation}
                    onChange={e => setPassData({...passData, password_confirmation: e.target.value})}
                    className="w-full rounded-2xl bg-background border-input focus:border-primary-500 focus:ring-primary-500 text-foreground" 
                    required
                />
             </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button type="submit" className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-muted-foreground font-medium text-sm">Update Password</button>
          </div>
        </form>

        {isInst && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border border-l-4 border-l-primary-600">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Instructor Teaching Settings (Coming Soon)
            </h2>
            <div className="space-y-4 opacity-75">
               <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-primary-600 rounded bg-background border-input" />
                    <span className="text-sm text-muted-foreground">Receive email notifications when students complete a quiz</span>
                  </label>
               </div>
               <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked disabled className="w-4 h-4 text-primary-600 rounded bg-background border-input" />
                    <span className="text-sm text-muted-foreground">Allow students to see correct answers immediately after submission</span>
                  </label>
               </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
