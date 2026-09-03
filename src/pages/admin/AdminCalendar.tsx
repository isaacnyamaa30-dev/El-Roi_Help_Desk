import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import { formatServiceDate, todayISO } from '../../utils/format'

export function AdminCalendar() {
  const { bookings, loading } = useBookingList()
  if (loading) return <LoadingSpinner label="Loading calendar…" />

  const today = todayISO()
  const upcoming = bookings
    .filter(
      (b) =>
        b.service_date >= today &&
        !['cancelled', 'rejected'].includes(b.status),
    )
    .sort((a, b) =>
      (a.service_date + a.service_time).localeCompare(
        b.service_date + b.service_time,
      ),
    )

  const byDate = new Map<string, typeof upcoming>()
  for (const b of upcoming) {
    byDate.set(b.service_date, [...(byDate.get(b.service_date) ?? []), b])
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Upcoming bookings grouped by service day"
      />
      {byDate.size === 0 ? (
        <EmptyState title="No upcoming bookings." />
      ) : (
        <div className="space-y-8">
          {[...byDate.entries()].map(([date, list]) => (
            <section key={date}>
              <h2 className="mb-3 font-display text-lg font-bold text-navy">
                {formatServiceDate(date)}{' '}
                <span className="text-sm font-normal text-ink-soft">
                  · {list.length} booking{list.length === 1 ? '' : 's'}
                </span>
              </h2>
              <BookingTable
                bookings={list}
                basePath="/admin/bookings"
                columns={['number', 'service', 'client', 'staff', 'time', 'status']}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
