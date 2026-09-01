import {
  TICKET_CATEGORIES,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_ORDER,
} from '../../constants'
import type { TicketFilters } from '../../services/tickets'

const selectClass =
  'rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

export type SortKey = 'newest' | 'oldest' | 'priority' | 'updated'

export function TicketFilterBar({
  filters,
  sort,
  onChange,
  onSortChange,
  showAssignee = false,
}: {
  filters: TicketFilters
  sort: SortKey
  onChange: (next: TicketFilters) => void
  onSortChange: (sort: SortKey) => void
  showAssignee?: boolean
}) {
  const set = (patch: Partial<TicketFilters>) =>
    onChange({ ...filters, ...patch })

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        type="search"
        placeholder="Search number or title…"
        value={filters.search ?? ''}
        onChange={(e) => set({ search: e.target.value })}
        className={`${selectClass} min-w-[12rem] flex-1`}
      />

      <select
        className={selectClass}
        value={filters.status ?? 'all'}
        onChange={(e) =>
          set({ status: e.target.value as TicketFilters['status'] })
        }
      >
        <option value="all">All statuses</option>
        {TICKET_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {TICKET_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.priority ?? 'all'}
        onChange={(e) =>
          set({ priority: e.target.value as TicketFilters['priority'] })
        }
      >
        <option value="all">All priorities</option>
        {TICKET_PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {TICKET_PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.category ?? 'all'}
        onChange={(e) => set({ category: e.target.value })}
      >
        <option value="all">All categories</option>
        {TICKET_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {showAssignee && (
        <select
          className={selectClass}
          value={filters.assignedTo ?? 'all'}
          onChange={(e) =>
            set({ assignedTo: e.target.value as TicketFilters['assignedTo'] })
          }
        >
          <option value="all">Any assignment</option>
          <option value="unassigned">Unassigned</option>
        </select>
      )}

      <select
        className={selectClass}
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="priority">Priority</option>
        <option value="updated">Last updated</option>
      </select>
    </div>
  )
}
