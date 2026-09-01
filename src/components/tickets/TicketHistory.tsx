import { HISTORY_ACTION_LABELS } from '../../constants'
import { formatDateTime } from '../../utils/format'
import type { TicketHistoryEntry } from '../../types'

function describe(entry: TicketHistoryEntry): string {
  const label = HISTORY_ACTION_LABELS[entry.action] ?? entry.action
  if (entry.old_value && entry.new_value)
    return `${label}: ${entry.old_value} → ${entry.new_value}`
  if (entry.new_value) return `${label} (${entry.new_value})`
  return label
}

export function TicketHistory({ entries }: { entries: TicketHistoryEntry[] }) {
  if (entries.length === 0)
    return <p className="text-sm text-gray-500">No history yet.</p>

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
