import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants'
import type { BookingWithRelations } from '../types'

export function countByStatus(bookings: BookingWithRelations[]) {
  const acc = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    assigned: 0,
    on_the_way: 0,
    in_progress: 0,
    awaiting_payment: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    unassigned: 0,
    upcoming: 0,
    active: 0,
  }
  const today = new Date().toISOString().slice(0, 10)
  for (const b of bookings) {
    acc[b.status] += 1
    if (
      !b.assigned_staff_id &&
      [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(
        b.status as 'pending' | 'confirmed',
      )
    )
      acc.unassigned += 1
    if (
      b.service_date >= today &&
      ![
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.REJECTED,
      ].includes(b.status as 'completed')
    )
      acc.upcoming += 1
    if (
      [
        BOOKING_STATUS.ASSIGNED,
        BOOKING_STATUS.ON_THE_WAY,
        BOOKING_STATUS.IN_PROGRESS,
      ].includes(b.status as 'assigned')
    )
      acc.active += 1
  }
  return acc
}

/** Revenue = sum of confirmed booking amounts that are marked paid. */
export function revenueSummary(bookings: BookingWithRelations[]) {
  let recorded = 0
  let outstanding = 0
  for (const b of bookings) {
    const total = b.total_amount ?? 0
    const paid = b.paid_total ?? 0
    recorded += paid
    if (
      b.status !== BOOKING_STATUS.CANCELLED &&
      b.status !== BOOKING_STATUS.REJECTED
    ) {
      outstanding += Math.max(total - paid, 0)
    }
  }
  return { recorded, outstanding }
}

/** Derive an overall payment state for a booking from what has been paid. */
export function paymentState(total: number | null, paid: number) {
  if (paid <= 0) return PAYMENT_STATUS.UNPAID
  if (total !== null && paid >= total) return PAYMENT_STATUS.PAID
  return PAYMENT_STATUS.PARTIALLY_PAID
}

export function groupBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, number>()
  for (const r of rows) {
    const k = key(r)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}
