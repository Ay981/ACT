import { useMemo } from 'react'

export default function ConversationList({ items, selectedId, onSelect, query, onQueryChange, userRole }){
  const filtered = useMemo(() => {
    const q = (query||'').toLowerCase()
    return items.filter(i => !q || i.title.toLowerCase().includes(q) || i.participant.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-border">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-secondary rounded-xl px-4 py-2.5">
          <SearchIcon className="w-4 h-4 text-slate-500 dark:text-muted-foreground" />
          <input value={query} onChange={e=>onQueryChange?.(e.target.value)} placeholder="Search" className="bg-transparent outline-none w-full text-sm text-slate-800 dark:text-foreground placeholder-slate-500 dark:placeholder-muted-foreground" />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {filtered.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-400 dark:text-muted-foreground">
             <p className="text-sm">No conversations found</p>
           </div>
        ) : (
        filtered.map(c => (
          <li key={c.id}>
            <button onClick={()=>onSelect?.(c.id)} className={`w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all ${selectedId===c.id ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm ring-1 ring-primary-100 dark:ring-primary-500/30' : 'hover:bg-slate-50 dark:hover:bg-accent/50'}`}>              
              <Avatar label={c.participant} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`font-semibold truncate text-sm ${selectedId===c.id ? 'text-primary-900 dark:text-white' : 'text-slate-900 dark:text-foreground'}`}>{c.title}</p>
                  {(() => {
                    // Sorting logic inside conversation list implies we want to show time of last message eventually
                    const unreadCount = Array.isArray(c.messages) ? c.messages.filter(m => m.sender !== userRole && m.read === false).length : 0;
                    return unreadCount > 0 ? (
                      <span className="min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] font-bold px-1.5 rounded-full bg-primary-600 text-white shadow-sm ring-1 ring-white dark:ring-background">
                        {unreadCount}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="flex justify-between items-center">
                   <p className={`text-xs truncate ${selectedId===c.id ? 'text-primary-700 dark:text-slate-300' : 'text-slate-500 dark:text-muted-foreground'}`}>
                     {c.participant}
                   </p>
                   {c.lastMessageAt && (
                     <span className={`text-[10px] whitespace-nowrap ml-2 ${selectedId===c.id ? 'text-primary-600/80 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                       {new Date(c.lastMessageAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? new Date(c.lastMessageAt).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})
                          : new Date(c.lastMessageAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                     </span>
                   )}
                </div>
              </div>
            </button>
          </li>
        ))
        )}
      </ul>
    </div>
  )
}

function SearchIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-3.6-3.6"/></svg>)}
function Avatar({ label }){
  const initials = label.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white grid place-items-center text-sm font-semibold">{initials}</div>
}
