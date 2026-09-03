import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'

export function StaffJobs({ completed = false }: { completed?: boolean }) {
  const { bookings, loading, error } = useBookingList(
    completed ? { scope: 'completed' } : {},
  )
  const rows = completed
    ? bookings
    : bookings.filter(
        (b) => !['completed', 'cancelled', 'rejected'].includes(b.status),
      )

  return (
    <div>
      <PageHeader title={completed ? 'Completed Jobs' : 'My Jobs'} />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingSpinner label="Loading jobs…" />
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            completed
              ? "You haven't completed any jobs yet."
              : 'No jobs are currently assigned to you.'
          }
        />
      ) : (
        <BookingTable
          bookings={rows}
          basePath="/staff/jobs"
          columns={['number', 'service', 'client', 'date', 'time', 'status']}
        />
      )}
    </div>
  )
}
