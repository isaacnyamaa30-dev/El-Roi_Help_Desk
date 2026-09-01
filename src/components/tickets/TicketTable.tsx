import { Link } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../common/Badges'
import { formatDate, timeAgo } from '../../utils/format'
import type { TicketWithPeople } from '../../types'

type Column =
  | 'number'
  | 'title'
  | 'category'
  | 'priority'
  | 'status'
  | 'assignee'
  | 'creator'
  | 'created'
  | 'updated'

const DEFAULT_COLUMNS: Column[] = [
  'number',
  'title',
  'category',
  'priority',
  'status',
  'assignee',
  'created',
]

const HEADERS: Record<Column, string> = {
  number: 'Ticket',
  title: 'Title',
  category: 'Category',
  priority: 'Priority',
  status: 'Status',
  assignee: 'Assigned Agent',
  creator: 'Submitted By',
  created: 'Created',
  updated: 'Last Updated',
}

/**
 * Ticket list. Scrolls horizontally on narrow screens; collapses to stacked
 * cards below `md`.
 */
export function TicketTable({
  tickets,
  columns = DEFAULT_COLUMNS,
  basePath = '/tickets',
}: {
  tickets: TicketWithPeople[]
  columns?: Column[]
  basePath?: string
}) {
  const cell = (t: TicketWithPeople, col: Column) => {
    switch (col) {
      case 'number':
        return (
          <span className="font-mono text-xs font-semibold text-royal">
            {t.ticket_number}
          </span>
        )
      case 'title':
        return <span className="font-medium text-navy">{t.title}</span>
      case 'category':
        return t.category
      case 'priority':
        return <PriorityBadge priority={t.priority} />
      case 'status':
        return <StatusBadge status={t.status} />
      case 'assignee':
        return t.assignee?.full_name ?? (
          <span className="text-gray-400">Unassigned</span>
        )
      case 'creator':
        return t.creator?.full_name ?? '—'
      case 'created':
        return formatDate(t.created_at)
      case 'updated':
        return timeAgo(t.updated_at)
    }
  }

  return (
    <>
      {/* table (md and up) */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {HEADERS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <tr key={t.id} className="transition hover:bg-navy-tint/50">
                {columns.map((c) => (
                  <td key={c} className="px-4 py-3 align-middle">
                    {c === 'number' || c === 'title' ? (
                      <Link to={`${basePath}/${t.id}`} className="hover:underline">
                        {cell(t, c)}
                      </Link>
                    ) : (
                      cell(t, c)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards (below md) */}
      <ul className="space-y-3 md:hidden">
        {tickets.map((t) => (
          <li key={t.id}>
            <Link
              to={`${basePath}/${t.id}`}
              className="block rounded-lg border border-gray-200 border-l-4 border-l-navy bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-royal">
                  {t.ticket_number}
                </span>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 font-medium text-navy">{t.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <PriorityBadge priority={t.priority} />
                <span>{t.category}</span>
                <span>·</span>
                <span>{t.assignee?.full_name ?? 'Unassigned'}</span>
                <span>·</span>
                <span>{formatDate(t.created_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
