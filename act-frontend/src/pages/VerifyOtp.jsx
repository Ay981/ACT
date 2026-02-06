import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { verifyOtp } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const testingOtp = location.state?.otp // Get OTP from signup for testing
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])
  const { refreshUser } = useAuth()

  useEffect(() => {
    if (!email) {
      navigate('/signup')
    }
    
    // Auto-fill OTP if in testing mode
    if (testingOtp && testingOtp.length === 6) {
      const otpArray = testingOtp.split('')
      setOtp(otpArray)
    }
  }, [email, navigate, testingOtp])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)
    if (pastedData.length === 6) {
        inputRefs.current[5].focus()
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }

    setLoading(true)
    try {
      const res = await verifyOtp({ email, otp: code })
      
      // Update global auth state
      const user = await refreshUser()
      
      if (user) {
         navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')
      } else {
         // Fallback if refreshUser fails but verify succeed (unlikely with Sanctum)
         navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">Check your email</h2>
        <p className="text-slate-600 dark:text-muted-foreground mb-4">
          We sent a verification code to <span className="font-medium text-slate-900 dark:text-foreground">{email}</span>
        </p>

        {testingOtp && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl">
            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-1">⚠️ TESTING MODE</p>
            <p className="text-amber-700 dark:text-amber-300 text-xs mb-2">
              OTP has been pre-filled for testing. In production, you'll need to check your email.
            </p>
            <div className="bg-amber-100 dark:bg-amber-900/40 rounded-lg p-3 border border-amber-300 dark:border-amber-800">
              <p className="text-amber-900 dark:text-amber-100 font-mono text-lg font-bold">{testingOtp}</p>
              <p className="text-amber-600 dark:text-amber-300 text-xs mt-1">Your verification code</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 dark:border-input bg-white dark:bg-input text-slate-900 dark:text-foreground rounded-xl focus:border-primary-500 focus:ring-primary-500 outline-none transition-all"
              />
            ))}
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.some(d => !d)}
            className="w-full bg-primary-600 text-white rounded-xl py-3 font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-slate-500 dark:text-muted-foreground">
            Didn't receive the email? <button className="text-primary-600 font-medium hover:underline">Resend Code</button>
        </p>
      </div>
    </div>
  )
}
