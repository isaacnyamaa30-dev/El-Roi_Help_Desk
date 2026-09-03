import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from '../../constants'
import type { BookingStatus, PaymentStatus } from '../../types'

const base =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`${base} ${BOOKING_STATUS_STYLES[status]}`}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`${base} ${PAYMENT_STATUS_STYLES[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}
