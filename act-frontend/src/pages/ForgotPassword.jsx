import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true)
    // TODO: replace with real password reset API
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setMessage('If an account exists for this email, a reset link has been sent.')
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex w-full items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
          </div>
          <div className="bg-white shadow-soft rounded-2xl border border-slate-100 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Reset your password</h2>
            <p className="mt-1 text-slate-500">We’ll send you a link to reset it</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border-slate-300 focus:border-primary-500 focus:ring-primary-500 bg-white px-4 py-3 text-sm shadow-sm" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-emerald-700">{message}</p>}
              <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 shadow-sm disabled:opacity-60">
                {loading && (
                  <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                )}
                Send Reset Link
              </button>
            </form>

            <div className="mt-6 text-sm text-center text-slate-600">
              <Link to="/login" className="text-primary-700 font-medium">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
