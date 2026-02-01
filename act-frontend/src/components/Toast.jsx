import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (msg) => addToast(msg, 'success')
  const error = (msg) => addToast(msg, 'error')
  const info = (msg) => addToast(msg, 'info')

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[200px] px-6 py-4 rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 fade-in duration-300
              ${toast.type === 'success' ? 'bg-card border-2 border-green-500 text-foreground' : ''}
              ${toast.type === 'error' ? 'bg-card border-2 border-red-500 text-foreground' : ''}
              ${toast.type === 'info' ? 'bg-slate-800 border-2 border-slate-600 text-white' : ''}
              flex flex-col items-center justify-center text-center
            `}
          >
            {toast.type === 'success' && (
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
