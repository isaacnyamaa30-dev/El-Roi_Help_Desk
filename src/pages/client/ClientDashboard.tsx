import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import { useAuth } from '../../hooks/useAuth'
import { countByStatus } from '../../utils/metrics'

export function ClientDashboard() {
  const { profile } = useAuth()
  const { bookings, loading, error } = useBookingList()
  const m = countByStatus(bookings)

  const cta = (
    <div className="flex gap-2">
      <Link
        to="/book/cleaning"
        className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark"
      >
        Book Cleaning
      </Link>
      <Link
        to="/book/driving"
        className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-deep"
      >
        Book Driving
      </Link>
    </div>
  )

  return (
    <div>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        subtitle="Your weekend services at a glance"
        action={cta}
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Upcoming" value={m.upcoming} accent={m.upcoming > 0} />
        <MetricCard label="In Progress" value={m.in_progress} />
        <MetricCard label="Completed" value={m.completed} />
        <MetricCard label="Total Bookings" value={m.total} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Recent Bookings
      </h2>

      {loading ? (
        <LoadingSpinner label="Loading your bookings…" />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="You haven't booked a service yet."
          action={
            <Link
              to="/book"
              className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"
            >
              Book your first service
            </Link>
          }
        />
      ) : (
        <BookingTable
          bookings={bookings.slice(0, 8)}
          columns={['number', 'service', 'staff', 'date', 'amount', 'status']}
        />
      )}
    </div>
  )
}
