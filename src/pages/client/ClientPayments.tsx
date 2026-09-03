import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { PaymentStatusBadge } from '../../components/common/Badges'
import { MetricCard } from '../../components/common/MetricCard'
import { useBookingList } from '../../hooks/useBookings'
import { formatMoney, formatServiceDate } from '../../utils/format'

export function ClientPayments() {
  const { bookings, loading, error } = useBookingList()
  const billable = bookings.filter(
    (b) => b.total_amount !== null && b.status !== 'cancelled' && b.status !== 'rejected',
  )
  const totalDue = billable.reduce((s, b) => s + (b.total_amount ?? 0), 0)
  const totalPaid = billable.reduce((s, b) => s + (b.paid_total ?? 0), 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle="What you owe and what you've paid" />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingSpinner label="Loading payments…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Total Billed" value={formatMoney(totalDue)} />
            <MetricCard label="Total Paid" value={formatMoney(totalPaid)} />
            <MetricCard
              label="Outstanding"
              value={formatMoney(Math.max(totalDue - totalPaid, 0))}
              accent={totalDue - totalPaid > 0}
            />
          </div>

          {billable.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No billed bookings yet." />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Booking</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Paid</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billable.map((b) => (
                    <tr key={b.id} className="hover:bg-navy-tint/50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="font-mono text-xs font-semibold text-royal hover:underline"
                        >
                          {b.booking_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{b.service?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {formatServiceDate(b.service_date)}
                      </td>
                      <td className="px-4 py-3">{formatMoney(b.total_amount)}</td>
                      <td className="px-4 py-3">{formatMoney(b.paid_total ?? 0)}</td>
                      <td className="px-4 py-3">
                        {b.payment_state && (
                          <PaymentStatusBadge status={b.payment_state} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
