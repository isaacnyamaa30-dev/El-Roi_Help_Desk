import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import type { BookingFilters } from '../../services/bookings'

const TABS: { key: NonNullable<BookingFilters['scope']>; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
]

export function MyBookings() {
  const [scope, setScope] =
    useState<NonNullable<BookingFilters['scope']>>('upcoming')
  const { bookings, loading, error } = useBookingList({ scope })

  return (
    <div>
      <PageHeader
        title="My Bookings"
        action={
          <Link
            to="/book"
            className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark"
          >
            Book New Service
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              scope === t.key
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingSpinner label="Loading your bookings…" />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings in this view." />
      ) : (
        <BookingTable
          bookings={bookings}
          columns={['number', 'service', 'staff', 'date', 'amount', 'payment', 'status']}
        />
      )}
    </div>
  )
}
