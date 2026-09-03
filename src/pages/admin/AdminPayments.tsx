import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { MetricCard } from '../../components/common/MetricCard'
import { listAllPayments } from '../../services/payments'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from '../../constants'
import { formatDateTime, formatMoney } from '../../utils/format'
import type { Payment } from '../../types'

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState<PaymentMethod | 'all'>('all')

  useEffect(() => {
    listAllPayments()
      .then(setPayments)
      .catch((err) => console.error('[EL-ROI] Failed to load payments:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading payments…" />

  const rows =
    method === 'all'
      ? payments
      : payments.filter((p) => p.payment_method === method)
  const total = rows.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle="Every recorded payment" />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard label="Payments" value={rows.length} />
        <MetricCard label="Total Recorded" value={formatMoney(total)} />
      </div>

      <div className="mb-4">
        <select
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod | 'all')}
        >
          <option value="all">All methods</option>
          {PAYMENT_METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No payments recorded yet." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-navy-tint/50">
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(p.payment_date)}
                  </td>
                  <td className="px-4 py-3">
                    {p.booking ? (
                      <Link
                        to={`/admin/bookings/${p.booking.id}`}
                        className="font-mono text-xs font-semibold text-royal hover:underline"
                      >
                        {p.booking.booking_number}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {formatMoney(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    {PAYMENT_METHOD_LABELS[p.payment_method]}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.transaction_reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
