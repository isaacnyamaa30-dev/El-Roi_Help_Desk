import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import { listStaff } from '../../services/profiles'
import { countByStatus, revenueSummary } from '../../utils/metrics'
import { formatMoney, todayISO } from '../../utils/format'

export function AdminDashboard() {
  const { bookings, loading } = useBookingList()
  const [staffCount, setStaffCount] = useState<number | null>(null)
  const m = countByStatus(bookings)
  const rev = revenueSummary(bookings)
  const today = todayISO()

  useEffect(() => {
    listStaff()
      .then((s) => setStaffCount(s.length))
      .catch(() => setStaffCount(null))
  }, [])

  const todays = bookings.filter((b) => b.service_date === today)
  const unassigned = bookings.filter(
    (b) => !b.assigned_staff_id && ['pending', 'confirmed'].includes(b.status),
  )

  return (
    <div>
      <PageHeader title="Business Dashboard" subtitle="Weekend operations overview" />

      {loading ? (
        <LoadingSpinner label="Loading dashboard…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCard label="Today's Bookings" value={todays.length} />
            <MetricCard label="Pending" value={m.pending} accent={m.pending > 0} />
            <MetricCard label="Confirmed" value={m.confirmed} />
            <MetricCard label="Assigned" value={m.assigned} />
            <MetricCard label="In Progress" value={m.in_progress} />
            <MetricCard label="Completed" value={m.completed} />
            <MetricCard
              label="Unassigned"
              value={unassigned.length}
              accent={unassigned.length > 0}
            />
            <MetricCard label="Staff" value={staffCount ?? '—'} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard label="Recorded Revenue" value={formatMoney(rev.recorded)} />
            <MetricCard
              label="Outstanding Balance"
              value={formatMoney(rev.outstanding)}
              accent={rev.outstanding > 0}
            />
            <MetricCard label="Cancelled" value={m.cancelled + m.rejected} />
          </div>

          <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Unassigned Bookings
          </h2>
          {unassigned.length === 0 ? (
            <EmptyState title="All current bookings have been assigned." />
          ) : (
            <BookingTable
              bookings={unassigned}
              basePath="/admin/bookings"
              columns={['number', 'service', 'client', 'date', 'status']}
            />
          )}

          <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent Bookings
          </h2>
          <BookingTable
            bookings={bookings.slice(0, 8)}
            basePath="/admin/bookings"
            columns={['number', 'service', 'client', 'staff', 'date', 'status']}
          />
        </>
      )}
    </div>
  )
}
