/**
 * Centralized configuration for EL-ROI Services.
 * Import roles / statuses / pricing types from here — never scatter raw
 * string literals through the components.
 */

export const APP_NAME = 'EL-ROI Weekend Cleaning And Driving Services'
export const APP_SHORT_NAME = 'EL-ROI Services'
export const APP_TAGLINE = 'Book. Track. Serve.'
export const APP_TAGLINE_SECONDARY =
  'Professional weekend cleaning and driving services made simple.'

/** Developer and copyright owner. */
export const APP_AUTHOR = 'Isaac Nyamaa Boadi'

/** e.g. "© 2026 Isaac Nyamaa Boadi. All Rights Reserved." */
export const APP_COPYRIGHT = `© ${new Date().getFullYear()} ${APP_AUTHOR}. All Rights Reserved.`

/** Contact details for clients who want to reach out about services. */
export const APP_CONTACT = {
  phoneDisplay: '+233 24 374 4689',
  phoneHref: 'tel:+233243744689',
  whatsappHref: 'https://wa.me/233243744689',
  email: 'isaacnyamaa30@gmail.com',
  emailHref: 'mailto:isaacnyamaa30@gmail.com',
} as const

/* ------------------------------------------------------------------ roles */

export const ROLES = {
  CLIENT: 'client',
  CLEANER: 'cleaner',
  DRIVER: 'driver',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  client: 'Client',
  cleaner: 'Cleaner',
  driver: 'Driver',
  manager: 'Manager',
  admin: 'Administrator',
}

/** Manager + admin: can see and manage everything. */
export const STAFF_ROLES: Role[] = [ROLES.MANAGER, ROLES.ADMIN]

/** Field workers. */
export const WORKER_ROLES: Role[] = [ROLES.CLEANER, ROLES.DRIVER]

/* --------------------------------------------------------- service categories */

export const CATEGORY = {
  CLEANING: 'cleaning',
  DRIVING: 'driving',
} as const

export type CategorySlug = (typeof CATEGORY)[keyof typeof CATEGORY]

/** Which worker role handles which service category. */
export const CATEGORY_WORKER_ROLE: Record<CategorySlug, Role> = {
  cleaning: ROLES.CLEANER,
  driving: ROLES.DRIVER,
}

/* ----------------------------------------------------------- pricing types */

export const PRICING_TYPE = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
  DAILY: 'daily',
  PACKAGE: 'package',
  QUOTE: 'quote',
} as const

export type PricingType = (typeof PRICING_TYPE)[keyof typeof PRICING_TYPE]

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: 'Fixed price',
  hourly: 'Per hour',
  daily: 'Per day',
  package: 'Per package',
  quote: 'Request a quote',
}

/** Cleaning material options — these become `service_prices.pricing_option`. */
export const MATERIAL_OPTION = {
  ELROI: 'elroi_materials',
  CLIENT: 'client_materials',
} as const

export type MaterialOption =
  (typeof MATERIAL_OPTION)[keyof typeof MATERIAL_OPTION]

export const MATERIAL_OPTION_LABELS: Record<MaterialOption, string> = {
  elroi_materials: 'EL-ROI provides cleaning materials',
  client_materials: 'Client provides cleaning materials',
}

/* --------------------------------------------------------- booking statuses */

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  ON_THE_WAY: 'on_the_way',
  IN_PROGRESS: 'in_progress',
  AWAITING_PAYMENT: 'awaiting_payment',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  on_the_way: 'On The Way',
  in_progress: 'In Progress',
  awaiting_payment: 'Awaiting Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ASSIGNED,
  BOOKING_STATUS.ON_THE_WAY,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.AWAITING_PAYMENT,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.REJECTED,
]

/** Badge classes — navy = new, gold = in-flight, green = done. */
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-navy-tint text-navy ring-1 ring-navy/20',
  confirmed: 'bg-royal/10 text-royal-dark ring-1 ring-royal/20',
  assigned: 'bg-royal/10 text-royal-dark ring-1 ring-royal/20',
  on_the_way: 'bg-gold-tint text-gold-dark ring-1 ring-gold/40',
  in_progress: 'bg-gold-tint text-gold-dark ring-1 ring-gold/40',
  awaiting_payment: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',
  completed: 'bg-green-tint text-green-dark ring-1 ring-green/30',
  cancelled: 'bg-gray-200 text-gray-700 ring-1 ring-gray-300',
  rejected: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
}

/**
 * Which statuses staff may move a booking into from its current status.
 * Enforced in the UI; RLS + guard trigger still guard the write.
 */
export const STAFF_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['on_the_way', 'in_progress', 'cancelled'],
  on_the_way: ['in_progress', 'cancelled'],
  in_progress: ['awaiting_payment', 'completed'],
  awaiting_payment: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
}

/** The action buttons a field worker sees, keyed by current status. */
export const WORKER_STATUS_ACTIONS: Partial<
  Record<BookingStatus, { next: BookingStatus; label: string }[]>
> = {
  assigned: [{ next: 'on_the_way', label: "I'm On The Way" }],
  on_the_way: [{ next: 'in_progress', label: 'Start Service' }],
  in_progress: [{ next: 'completed', label: 'Complete Service' }],
}

/* --------------------------------------------------------- payment statuses */

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  unpaid: 'bg-gray-200 text-gray-700 ring-1 ring-gray-300',
  partially_paid: 'bg-gold-tint text-gold-dark ring-1 ring-gold/40',
  paid: 'bg-green-tint text-green-dark ring-1 ring-green/30',
  refunded: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
}

export const PAYMENT_METHOD = {
  CASH: 'cash',
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  OTHER: 'other',
} as const

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  PAYMENT_METHOD.CASH,
  PAYMENT_METHOD.MOBILE_MONEY,
  PAYMENT_METHOD.BANK_TRANSFER,
  PAYMENT_METHOD.OTHER,
]

/* --------------------------------------------------------- history actions */

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  booking_created: 'Booking created',
  booking_confirmed: 'Booking confirmed',
  booking_rejected: 'Booking rejected',
  booking_assigned: 'Staff assigned',
  booking_reassigned: 'Staff reassigned',
  status_changed: 'Status changed',
  price_changed: 'Price changed',
  payment_recorded: 'Payment recorded',
  service_started: 'Service started',
  service_completed: 'Service completed',
  booking_cancelled: 'Booking cancelled',
}

/* ------------------------------------------------------------------ misc */

export const CURRENCY_SYMBOL = 'GH₵'
export const BUSINESS_TIMEZONE = 'Africa/Accra'

/** 0 = Sunday … 6 = Saturday */
export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
