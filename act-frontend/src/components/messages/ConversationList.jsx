import { useMemo } from 'react'

export default function ConversationList({ items, selectedId, onSelect, query, onQueryChange }){
  const filtered = useMemo(() => {
    const q = (query||'').toLowerCase()
    return items.filter(i => !q || i.title.toLowerCase().includes(q) || i.participant.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <SearchIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input value={query} onChange={e=>onQueryChange?.(e.target.value)} placeholder="Search" className="bg-transparent outline-none w-full text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400" />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(c => (
          <li key={c.id}>
            <button onClick={()=>onSelect?.(c.id)} className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 ${selectedId===c.id ? 'bg-white dark:bg-slate-800 shadow-soft' : 'hover:bg-white dark:hover:bg-slate-800'}`}>              <Avatar label={c.participant} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate text-slate-900 dark:text-slate-100">{c.title}</p>
                  {c.unread>0 && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600 text-white">{c.unread}</span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{c.participant}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SearchIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-3.6-3.6"/></svg>)}
function Avatar({ label }){
  const initials = label.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white grid place-items-center text-sm font-semibold">{initials}</div>
}
