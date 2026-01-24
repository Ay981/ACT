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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[300px] px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all animate-in slide-in-from-right fade-in duration-300
              ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-500 text-slate-800' : ''}
              ${toast.type === 'info' ? 'bg-slate-800 border-slate-600 text-white' : ''}
              flex items-center justify-between
            `}
          >
            <div className="flex items-center gap-3">
               {toast.type === 'success' && <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
               {toast.type === 'error' && <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
               <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-slate-400 hover:text-slate-600">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
