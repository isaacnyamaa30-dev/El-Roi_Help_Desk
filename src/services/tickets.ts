import { supabase } from '../lib/supabase'
import { HISTORY_ACTION, TICKET_STATUS } from '../constants'
import type {
  NewTicketInput,
  Ticket,
  TicketHistoryEntry,
  TicketMessage,
  TicketStatus,
  TicketWithPeople,
} from '../types'
import type { TicketPriority } from '../constants'

/** Columns + joined creator/assignee names used across list & detail views. */
const TICKET_SELECT = `
  *,
  creator:profiles!tickets_created_by_fkey ( id, full_name, email ),
  assignee:profiles!tickets_assigned_to_fkey ( id, full_name, email )
`

export interface TicketFilters {
  status?: TicketStatus | 'all'
  priority?: TicketPriority | 'all'
  category?: string | 'all'
  assignedTo?: string | 'all' | 'unassigned'
  search?: string
}

type SortKey = 'newest' | 'oldest' | 'priority' | 'updated'

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/**
 * List tickets. RLS decides which rows come back per role:
 *   - user    -> only their own
 *   - agent   -> only tickets assigned to them
 *   - manager/admin -> all
 * Filters/sort are applied client-side for the MVP but the shape here lets
 * you push them into the query later.
 */
export async function listTickets(
  filters: TicketFilters = {},
  sort: SortKey = 'newest',
): Promise<TicketWithPeople[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error

  let rows = (data ?? []) as unknown as TicketWithPeople[]

  if (filters.status && filters.status !== 'all')
    rows = rows.filter((t) => t.status === filters.status)
  if (filters.priority && filters.priority !== 'all')
    rows = rows.filter((t) => t.priority === filters.priority)
  if (filters.category && filters.category !== 'all')
    rows = rows.filter((t) => t.category === filters.category)
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    rows =
      filters.assignedTo === 'unassigned'
        ? rows.filter((t) => !t.assigned_to)
        : rows.filter((t) => t.assigned_to === filters.assignedTo)
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    rows = rows.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.ticket_number.toLowerCase().includes(q),
    )
  }

  switch (sort) {
    case 'oldest':
      rows.sort((a, b) => a.created_at.localeCompare(b.created_at))
      break
    case 'updated':
      rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      break
    case 'priority':
      rows.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      )
      break
    default:
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  return rows
}

export async function getTicket(id: string): Promise<TicketWithPeople> {
  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as TicketWithPeople
}

export async function createTicket(
  input: NewTicketInput,
  userId: string,
): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      priority: input.priority,
      created_by: userId,
      // status defaults to 'open', ticket_number is set by a DB trigger,
      // 'ticket_created' history is written by a DB trigger.
    })
    .select()
    .single()
  if (error) throw error
  return data as Ticket
}

/** Manager/Admin: assign (or reassign) a ticket to an agent. */
export async function assignTicket(
  ticketId: string,
  agentId: string,
  managerId: string,
  currentStatus: TicketStatus,
): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({
      assigned_to: agentId,
      assigned_by: managerId,
      // Move an untouched ticket to 'assigned'; leave later statuses alone.
      status:
        currentStatus === TICKET_STATUS.OPEN ||
        currentStatus === TICKET_STATUS.REOPENED
          ? TICKET_STATUS.ASSIGNED
          : currentStatus,
    })
    .eq('id', ticketId)
  if (error) throw error
  // assignment + status history written by DB triggers
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
  if (error) throw error
  // status_changed history + lifecycle timestamps written by DB triggers
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({ priority })
    .eq('id', ticketId)
  if (error) throw error
}

/* --------------------------------------------------------------- messages */

export async function listMessages(ticketId: string): Promise<TicketMessage[]> {
  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*, sender:profiles!ticket_messages_sender_id_fkey ( id, full_name, role )')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as TicketMessage[]
}

export async function sendMessage(
  ticketId: string,
  senderId: string,
  message: string,
): Promise<void> {
  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: senderId,
    message: message.trim(),
    message_type: 'public',
  })
  if (error) throw error
  // updated_at bump + response history written by DB trigger
}

/* ---------------------------------------------------------------- history */

export async function listHistory(
  ticketId: string,
): Promise<TicketHistoryEntry[]> {
  const { data, error } = await supabase
    .from('ticket_history')
    .select('*, actor:profiles!ticket_history_changed_by_fkey ( id, full_name, role )')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as TicketHistoryEntry[]
}

export { HISTORY_ACTION }
