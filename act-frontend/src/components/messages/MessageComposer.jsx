import { useState } from 'react'

export default function MessageComposer({ onSend }){
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend?.(t)
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-3 border-t border-slate-200">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" />
      <button type="submit" className="px-3 py-2 rounded-xl bg-primary-600 text-white text-sm">Send</button>
    </form>
  )
}
