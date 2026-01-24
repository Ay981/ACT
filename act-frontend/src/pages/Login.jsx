import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import GuestLayout from '../layouts/GuestLayout.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login({ email: email.toLowerCase(), password })
      const role = user?.role || 'student'
      
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'instructor') navigate('/instructor/dashboard')
      else navigate('/dashboard')

    } catch (err) {
      console.error(err)
      if (err.status === 422 || err.status === 401) {
          setError('Invalid email or password.')
      } else if (err.status === 419) {
          setError('Session expired. Please refresh and try again.')
      } else {
          setError(err.message || 'Login failed. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <GuestLayout>
      <div className="flex justify-center w-full">
        
        {/* Login Form */}
        <div className="w-full max-w-md">
           <div className="mb-6">
             <div className="flex items-center gap-2 mb-8 justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">A</div>
                <span className="text-xl font-bold text-slate-700">ACT E-Learning</span>
             </div>

             <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100 relative">
               <h2 className="text-3xl font-bold text-slate-800">Welcome back</h2>
               <p className="mt-2 text-slate-500 mb-8">Login to continue to your courses</p>

               {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {error}
                </div>
               )}

               <form onSubmit={onSubmit} className="space-y-5">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                   <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                     placeholder="student@example.com"
                     required
                   />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-slate-600">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-primary-600 font-semibold hover:text-primary-700">Forgot password?</Link>
                 </div>

                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {loading ? 'Logging in...' : 'Login'}
                 </button>

                 <div className="text-center mt-6">
                    <span className="text-slate-500 text-sm">Don't have an account? </span>
                    <Link to="/signup" className="text-primary-600 font-bold text-sm hover:underline">Sign up for free</Link>
                 </div>

               </form>
             </div>
           </div>
        </div>

      </div>
    </GuestLayout>
  )
}
