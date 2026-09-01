import {
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLES,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
} from '../../constants'
import type { TicketPriority, TicketStatus } from '../../types'

const base =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`${base} ${TICKET_STATUS_STYLES[status]}`}>
      {TICKET_STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`${base} ${TICKET_PRIORITY_STYLES[priority]}`}>
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  )
}
