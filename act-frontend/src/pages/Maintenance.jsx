import { Link } from 'react-router-dom'

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-slate-100">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Under Maintenance</h1>
        <p className="text-slate-600 mb-6">
          We are currently updating our platform to serve you better. instructor and student access is temporarily paused.
        </p>
        <p className="text-sm text-slate-400">Please check back shortly.</p>
        
        <div className="mt-8 border-t border-slate-100 pt-6">
           <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Are you an Admin? Login</Link>
        </div>
      </div>
    </div>
  )
}
