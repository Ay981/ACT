export default function StatCard({ label, value, delta, icon }){
  const isPositive = (delta || '').toString().trim().startsWith('+')
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-between transition-shadow hover:shadow-soft">
      <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
        {delta && (
          <div className={`mt-1 text-xs ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>{delta}</div>
        )}
      </div>
      {icon && (
        <div className="w-10 h-10 grid place-items-center rounded-xl bg-primary-50 border border-primary-200 text-primary-700">
          {icon}
        </div>
      )}
    </div>
  )
}
