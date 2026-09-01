/**
 * Centralized configuration for EL-ROI Help Desk Tracker.
 * Avoid scattering string literals for roles / statuses / priorities /
 * categories through the app — import from here instead.
 */

export const APP_NAME = 'EL-ROI Help Desk Tracker'
export const APP_TAGLINE = 'Every Issue Seen. Every Request Tracked.'
export const APP_TAGLINE_SECONDARY = 'Report. Track. Resolve.'

/* ------------------------------------------------------------------ roles */

export const ROLES = {
  USER: 'user',
  AGENT: 'agent',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  user: 'User',
  agent: 'Agent',
  manager: 'Manager',
  admin: 'Administrator',
}

/** Roles allowed to view/manage every ticket. */
export const STAFF_ROLES: Role[] = [ROLES.MANAGER, ROLES.ADMIN]

/* --------------------------------------------------------------- statuses */

export const TICKET_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  WAITING_FOR_USER: 'waiting_for_user',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
} as const

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting_for_user: 'Waiting for User',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
}

export const TICKET_STATUS_ORDER: TicketStatus[] = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.ASSIGNED,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.WAITING_FOR_USER,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
  TICKET_STATUS.REOPENED,
]

/**
 * Tailwind classes for each status badge. Tuned to the EL-ROI brand:
 * navy for new/active, gold for in-flight, green for done.
 * Each badge also carries a ring so colour is never the only signal.
 */
export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'bg-navy-tint text-navy ring-1 ring-navy/20',
  assigned: 'bg-royal/10 text-royal-dark ring-1 ring-royal/20',
  in_progress: 'bg-gold-tint text-gold-dark ring-1 ring-gold/40',
  waiting_for_user: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',
  resolved: 'bg-green-tint text-green-dark ring-1 ring-green/30',
  closed: 'bg-gray-200 text-gray-700 ring-1 ring-gray-300',
  reopened: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
}

/* ------------------------------------------------------------- priorities */

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY]

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const TICKET_PRIORITY_OPTIONS: TicketPriority[] = [
  TICKET_PRIORITY.LOW,
  TICKET_PRIORITY.MEDIUM,
  TICKET_PRIORITY.HIGH,
  TICKET_PRIORITY.URGENT,
]

export const TICKET_PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-700 ring-1 ring-gray-300',
  medium: 'bg-navy-tint text-navy ring-1 ring-navy/20',
  high: 'bg-gold-tint text-gold-dark ring-1 ring-gold/40',
  urgent: 'bg-red-100 text-red-800 ring-1 ring-red-300',
}

export const DEFAULT_PRIORITY: TicketPriority = TICKET_PRIORITY.MEDIUM

/* ------------------------------------------------------------- categories */

export const TICKET_CATEGORIES = [
  'Hardware',
  'Software',
  'Internet / Network',
  'Account / Login',
  'Printer',
  'Email',
  'Access / Permission',
  'General Support',
  'Other',
] as const

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]

/* ---------------------------------------------------------- history verbs */

export const HISTORY_ACTION = {
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_REASSIGNED: 'ticket_reassigned',
  PRIORITY_CHANGED: 'priority_changed',
  STATUS_CHANGED: 'status_changed',
  AGENT_RESPONSE_ADDED: 'agent_response_added',
  USER_RESPONSE_ADDED: 'user_response_added',
  TICKET_RESOLVED: 'ticket_resolved',
  TICKET_REOPENED: 'ticket_reopened',
  TICKET_CLOSED: 'ticket_closed',
} as const

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  ticket_created: 'Ticket created',
  ticket_assigned: 'Ticket assigned',
  ticket_reassigned: 'Ticket reassigned',
  priority_changed: 'Priority changed',
  status_changed: 'Status changed',
  agent_response_added: 'Agent responded',
  user_response_added: 'User responded',
  ticket_resolved: 'Ticket resolved',
  ticket_reopened: 'Ticket reopened',
  ticket_closed: 'Ticket closed',
}

/* ---------------------------------------------- allowed status transitions */

/**
 * Which statuses a support user may move a ticket into from its current
 * status. Enforced in the UI; RLS still guards the write server-side.
 */
export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ['assigned', 'in_progress', 'closed'],
  assigned: ['in_progress', 'waiting_for_user', 'closed'],
  in_progress: ['waiting_for_user', 'resolved', 'closed'],
  waiting_for_user: ['in_progress', 'resolved', 'closed'],
  resolved: ['reopened', 'closed'],
  reopened: ['in_progress', 'waiting_for_user', 'resolved', 'closed'],
  closed: ['reopened'],
}
