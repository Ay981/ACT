export default function AdminModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
