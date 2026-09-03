import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import { useAuth } from '../../hooks/useAuth'
import { countByStatus } from '../../utils/metrics'
import { todayISO } from '../../utils/format'

export function StaffDashboard() {
  const { role } = useAuth()
  // RLS already limits these to jobs assigned to this worker.
  const { bookings, loading, error } = useBookingList()
  const m = countByStatus(bookings)
  const today = todayISO()
  const todays = bookings.filter(
    (b) =>
      b.service_date === today &&
      !['completed', 'cancelled', 'rejected'].includes(b.status),
  )

  return (
    <div>
      <PageHeader
        title={role === 'driver' ? 'Driver Dashboard' : 'Cleaner Dashboard'}
        subtitle="Jobs assigned to you"
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="My Jobs Today" value={todays.length} accent={todays.length > 0} />
        <MetricCard label="Upcoming" value={m.upcoming} />
        <MetricCard label="In Progress" value={m.in_progress} />
        <MetricCard label="Completed" value={m.completed} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Today's Jobs
      </h2>
      {loading ? (
        <LoadingSpinner label="Loading jobs…" />
      ) : todays.length === 0 ? (
        <EmptyState title="No jobs are assigned to you today." />
      ) : (
        <BookingTable
          bookings={todays}
          basePath="/staff/jobs"
          columns={['number', 'service', 'client', 'time', 'status']}
        />
      )}
    </div>
  )
}
