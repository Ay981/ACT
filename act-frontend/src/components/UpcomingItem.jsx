export default function UpcomingItem({ item }) {
  const dateStr = useDate(item.due)
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 transition-shadow hover:shadow-soft">
      <div>
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.course}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-foreground">{dateStr}</div>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Due</span>
      </div>
    </div>
  )
}

function useDate(timestamp){
  try {
    const d = new Date(timestamp)
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric'}).format(d)
  } catch {
    return ''
  }
}
