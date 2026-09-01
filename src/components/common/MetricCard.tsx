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
      className={`rounded-lg border p-4 ${
        accent
          ? 'border-gold/40 bg-gold/10'
          : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-navy">{value}</p>
    </div>
  )
}
