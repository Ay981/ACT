export default function QuizQuickCard({ title, questions, onView, onComment, onContact }){
  return (
    <div className="rounded-2xl bg-blue-600 text-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="opacity-90">›</span>
      </div>
      <div className="mt-1 text-sm text-blue-100 flex items-center gap-2">
        <BookIcon className="w-4 h-4" />
        <span>{questions} questions</span>
      </div>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <button onClick={onView} className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium">View Quiz</button>
        <button onClick={onComment} className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium">Comment</button>
        <button onClick={onContact} className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium">Contact</button>
      </div>
    </div>
  )
}

function BookIcon(props){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M4 4v16.5"/>
      <path d="M20 22V6H6.5A2.5 2.5 0 0 0 4 8.5"/>
    </svg>
  )
}
