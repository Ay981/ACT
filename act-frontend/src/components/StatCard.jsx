export default function StatCard({ label, value, delta, icon }){
  const isPositive = (delta || '').toString().trim().startsWith('+')
  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between transition-shadow hover:shadow-soft">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-foreground">{value}</div>
        {delta && (
          <div className={`mt-1 text-xs ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{delta}</div>
        )}
      </div>
      {icon && (
        <div className="w-10 h-10 grid place-items-center rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400">
            {icon}
        </div>
      )}
    </div>
  )
}
