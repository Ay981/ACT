export default function UpcomingItem({ item }) {
  const dateStr = useDate(item.due)
  return (
    <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3 transition-shadow hover:shadow-soft">
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-slate-500">{item.course}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-slate-700">{dateStr}</div>
        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Due</span>
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
