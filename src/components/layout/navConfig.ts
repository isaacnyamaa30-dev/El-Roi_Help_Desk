import { ROLES, type Role } from '../../constants'

export interface NavItem {
  label: string
  to: string
  end?: boolean
}

const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', end: true },
  { label: 'Book Service', to: '/book' },
  { label: 'My Bookings', to: '/bookings', end: true },
  { label: 'Payments', to: '/payments' },
  { label: 'Profile', to: '/profile' },
]

const STAFF_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/staff', end: true },
  { label: 'My Jobs', to: '/staff/jobs' },
  { label: 'Completed Jobs', to: '/staff/history' },
  { label: 'Profile', to: '/staff/profile' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Bookings', to: '/admin/bookings', end: true },
  { label: 'Calendar', to: '/admin/calendar' },
  { label: 'Services', to: '/admin/services' },
  { label: 'Prices', to: '/admin/prices' },
  { label: 'Clients', to: '/admin/clients' },
  { label: 'Staff', to: '/admin/staff' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Profile', to: '/profile' },
]

export function navForRole(role: Role | null): NavItem[] {
  switch (role) {
    case ROLES.CLEANER:
    case ROLES.DRIVER:
      return STAFF_NAV
    case ROLES.MANAGER:
    case ROLES.ADMIN:
      return ADMIN_NAV
    default:
      return CLIENT_NAV
  }
}

/** Where each role lands after login. */
export function homeForRole(role: Role | null): string {
  switch (role) {
    case ROLES.CLEANER:
    case ROLES.DRIVER:
      return '/staff'
    case ROLES.MANAGER:
    case ROLES.ADMIN:
      return '/admin'
    default:
      return '/dashboard'
  }
}
