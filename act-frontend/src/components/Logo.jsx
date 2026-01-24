export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" className="fill-primary-500"/>
        <circle cx="12" cy="12" r="4.5" className="fill-white"/>
      </svg>
      <span className="font-semibold text-lg tracking-tight">ACT E‑Learning</span>
    </div>
  )
}
