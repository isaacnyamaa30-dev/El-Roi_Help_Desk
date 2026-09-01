import { TICKET_PRIORITY, TICKET_STATUS } from '../constants'
import type { Ticket } from '../types'

export function countByStatus(tickets: Ticket[]) {
  const acc = {
    total: tickets.length,
    open: 0,
    assigned: 0,
    in_progress: 0,
    waiting_for_user: 0,
    resolved: 0,
    closed: 0,
    reopened: 0,
    unassigned: 0,
    urgent: 0,
  }
  for (const t of tickets) {
    acc[t.status] += 1
    if (!t.assigned_to && t.status !== TICKET_STATUS.CLOSED) acc.unassigned += 1
    if (t.priority === TICKET_PRIORITY.URGENT && t.status !== TICKET_STATUS.CLOSED)
      acc.urgent += 1
  }
  return acc
}

export function groupBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = key(r)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}
