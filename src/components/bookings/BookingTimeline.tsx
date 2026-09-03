import { HISTORY_ACTION_LABELS } from '../../constants'
import { formatDateTime } from '../../utils/format'
import type { BookingHistoryEntry } from '../../types'

function describe(entry: BookingHistoryEntry): string {
  const label = HISTORY_ACTION_LABELS[entry.action] ?? entry.action
  if (entry.action === 'status_changed' && entry.old_value && entry.new_value)
    return `${label}: ${labelize(entry.old_value)} → ${labelize(entry.new_value)}`
  if (entry.action === 'booking_assigned' || entry.action === 'booking_reassigned')
    return `${label}: ${entry.new_value}`
  if (entry.action === 'price_changed')
    return `${label}: ${entry.old_value} → ${entry.new_value}`
  if (entry.action === 'payment_recorded')
    return `${label}: GH₵${entry.new_value}`
  return label
}

function labelize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function BookingTimeline({
  entries,
}: {
  entries: BookingHistoryEntry[]
}) {
  if (entries.length === 0)
    return <p className="text-sm text-gray-500">No activity yet.</p>

  return (
    <ol className="space-y-3">
      {entries.map((e) => (
        <li key={e.id} className="flex gap-3 text-sm">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-royal" />
          <div>
            <p className="text-gray-800">{describe(e)}</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(e.created_at)}
              {e.actor?.full_name ? ` · by ${e.actor.full_name}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
