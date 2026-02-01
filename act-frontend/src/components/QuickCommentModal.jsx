import CommentsSection from './comments/CommentsSection.jsx'

export default function QuickCommentModal({ open, onClose, title = 'Comments', initialComments = [], currentUser = null }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-transparent w-full max-w-2xl mx-4">
        <div className="bg-card rounded-2xl shadow-soft border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="mt-4">
            <CommentsSection initialComments={initialComments} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  )
}
