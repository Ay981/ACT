import { useState } from 'react'

export default function CommentComposer({ onSubmit, onCancel, autoFocus = false, placeholder = 'Write a comment…', submitLabel = 'Comment', initialValue = '' }) {
  const [text, setText] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar />
      <div className="flex-1">
        <textarea
          className="w-full resize-y min-h-[80px] rounded-xl border border-input bg-background text-foreground focus:border-primary-500 focus:ring-primary-500 px-3 py-2 text-sm"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus={autoFocus}
        />
        <div className="mt-2 flex items-center gap-2">
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm">{submitLabel}</button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-accent text-sm">Cancel</button>
          )}
        </div>
      </div>
    </form>
  )
}

export function Avatar(){
  return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white grid place-items-center text-sm font-semibold">DK</div>
}
