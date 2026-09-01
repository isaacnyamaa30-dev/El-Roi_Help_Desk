export function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        accent
          ? 'border-gold/50 border-t-4 border-t-gold'
          : 'border-gray-200 border-t-4 border-t-navy/70'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          accent ? 'text-gold-dark' : 'text-navy'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
