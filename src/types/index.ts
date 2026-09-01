import type { Role, TicketPriority, TicketStatus } from '../constants'

export type { Role, TicketPriority, TicketStatus } from '../constants'

/** Row from the `profiles` table. */
export interface Profile {
  id: string
  full_name: string
  email: string | null
  role: Role
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Row from the `tickets` table. */
export interface Ticket {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  created_by: string
  assigned_to: string | null
  assigned_by: string | null
  created_at: string
  updated_at: string
  assigned_at: string | null
  resolved_at: string | null
  closed_at: string | null
}

/** Ticket joined with the profiles it references (used in list/detail views). */
export interface TicketWithPeople extends Ticket {
  creator: Pick<Profile, 'id' | 'full_name' | 'email'> | null
  assignee: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}

export type MessageType = 'public' | 'internal'

/** Row from the `ticket_messages` table. */
export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  message_type: MessageType
  created_at: string
  updated_at: string
  sender?: Pick<Profile, 'id' | 'full_name' | 'role'> | null
}

/** Row from the `ticket_history` table. */
export interface TicketHistoryEntry {
  id: string
  ticket_id: string
  action: string
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  actor?: Pick<Profile, 'id' | 'full_name' | 'role'> | null
}

export interface NewTicketInput {
  title: string
  category: string
  priority: TicketPriority
  description: string
}
