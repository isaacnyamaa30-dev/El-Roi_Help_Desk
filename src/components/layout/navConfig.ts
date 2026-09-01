import { ROLES, type Role } from '../../constants'

export interface NavItem {
  label: string
  to: string
  end?: boolean
}

const USER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', end: true },
  { label: 'Create Ticket', to: '/tickets/new' },
  { label: 'My Tickets', to: '/tickets', end: true },
  { label: 'Profile', to: '/profile' },
]

const AGENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/agent', end: true },
  { label: 'Assigned Tickets', to: '/agent/tickets' },
  { label: 'Profile', to: '/profile' },
]

const STAFF_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'All Tickets', to: '/admin/tickets', end: true },
  { label: 'Unassigned', to: '/admin/tickets/unassigned' },
  { label: 'Agents', to: '/admin/agents' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Profile', to: '/profile' },
]

export function navForRole(role: Role | null): NavItem[] {
  switch (role) {
    case ROLES.AGENT:
      return AGENT_NAV
    case ROLES.MANAGER:
    case ROLES.ADMIN:
      return STAFF_NAV
    default:
      return USER_NAV
  }
}

/** Where each role lands after login. */
export function homeForRole(role: Role | null): string {
  switch (role) {
    case ROLES.AGENT:
      return '/agent'
    case ROLES.MANAGER:
    case ROLES.ADMIN:
      return '/admin'
    default:
      return '/dashboard'
  }
}
