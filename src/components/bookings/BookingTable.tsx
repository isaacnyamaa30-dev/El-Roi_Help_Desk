import { Link } from 'react-router-dom'
import { BookingStatusBadge, PaymentStatusBadge } from '../common/Badges'
import {
  formatMoney,
  formatServiceDate,
  formatServiceTime,
} from '../../utils/format'
import type { BookingWithRelations } from '../../types'

type Column =
  | 'number'
  | 'service'
  | 'client'
  | 'staff'
  | 'date'
  | 'time'
  | 'amount'
  | 'payment'
  | 'status'

const HEADERS: Record<Column, string> = {
  number: 'Booking',
  service: 'Service',
  client: 'Client',
  staff: 'Assigned',
  date: 'Date',
  time: 'Time',
  amount: 'Amount',
  payment: 'Payment',
  status: 'Status',
}

const DEFAULT: Column[] = [
  'number',
  'service',
  'date',
  'amount',
  'payment',
  'status',
]

export function BookingTable({
  bookings,
  columns = DEFAULT,
  basePath = '/bookings',
}: {
  bookings: BookingWithRelations[]
  columns?: Column[]
  basePath?: string
}) {
  const cell = (b: BookingWithRelations, c: Column) => {
    switch (c) {
      case 'number':
        return (
          <span className="font-mono text-xs font-semibold text-royal">
            {b.booking_number}
          </span>
        )
      case 'service':
        return (
          <span className="font-medium text-navy">
            {b.service?.name ?? '—'}
            {b.package?.name ? ` · ${b.package.name}` : ''}
          </span>
        )
      case 'client':
        return b.client?.full_name ?? '—'
      case 'staff':
        return (
          b.staff?.full_name ?? <span className="text-gray-400">Unassigned</span>
        )
      case 'date':
        return formatServiceDate(b.service_date)
      case 'time':
        return formatServiceTime(b.service_time)
      case 'amount':
        return formatMoney(b.total_amount)
      case 'payment':
        return b.payment_state ? (
          <PaymentStatusBadge status={b.payment_state} />
        ) : (
          '—'
        )
      case 'status':
        return <BookingStatusBadge status={b.status} />
    }
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {HEADERS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="transition hover:bg-navy-tint/50">
                {columns.map((c) => (
                  <td key={c} className="px-4 py-3 align-middle">
                    {c === 'number' || c === 'service' ? (
                      <Link to={`${basePath}/${b.id}`} className="hover:underline">
                        {cell(b, c)}
                      </Link>
                    ) : (
                      cell(b, c)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {bookings.map((b) => (
          <li key={b.id}>
            <Link
              to={`${basePath}/${b.id}`}
              className="block rounded-lg border border-gray-200 border-l-4 border-l-navy bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-royal">
                  {b.booking_number}
                </span>
                <BookingStatusBadge status={b.status} />
              </div>
              <p className="mt-1 font-medium text-navy">
                {b.service?.name ?? '—'}
                {b.package?.name ? ` · ${b.package.name}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <span>{formatServiceDate(b.service_date)}</span>
                <span>·</span>
                <span>{formatServiceTime(b.service_time)}</span>
                <span>·</span>
                <span className="font-medium text-navy">
                  {formatMoney(b.total_amount)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
