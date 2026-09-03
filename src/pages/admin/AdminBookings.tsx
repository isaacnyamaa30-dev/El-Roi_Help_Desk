import { useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { BookingTable } from '../../components/bookings/BookingTable'
import { useBookingList } from '../../hooks/useBookings'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
} from '../../constants'
import type { BookingFilters } from '../../services/bookings'

const selectClass =
  'rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

export function AdminBookings({ unassignedOnly = false }: { unassignedOnly?: boolean }) {
  const [filters, setFilters] = useState<BookingFilters>(
    unassignedOnly ? { staffId: 'unassigned' } : {},
  )
  const { bookings, loading, error } = useBookingList(filters)
  const set = (patch: Partial<BookingFilters>) =>
    setFilters((f) => ({ ...f, ...patch }))

  return (
    <div>
      <PageHeader
        title={unassignedOnly ? 'Unassigned Bookings' : 'All Bookings'}
      />

      {!unassignedOnly && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search number, client, phone…"
            value={filters.search ?? ''}
            onChange={(e) => set({ search: e.target.value })}
            className={`${selectClass} w-full flex-1 sm:w-auto sm:min-w-[12rem]`}
          />
          <select
            className={selectClass}
            value={filters.status ?? 'all'}
            onChange={(e) =>
              set({ status: e.target.value as BookingFilters['status'] })
            }
          >
            <option value="all">All statuses</option>
            {BOOKING_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filters.category ?? 'all'}
            onChange={(e) =>
              set({ category: e.target.value as BookingFilters['category'] })
            }
          >
            <option value="all">All categories</option>
            <option value="cleaning">Cleaning</option>
            <option value="driving">Driving</option>
          </select>
          <select
            className={selectClass}
            value={filters.staffId ?? 'all'}
            onChange={(e) =>
              set({ staffId: e.target.value as BookingFilters['staffId'] })
            }
          >
            <option value="all">Any assignment</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      )}

      {/* client-side category filter (needs joined slug) */}
      {(() => {
        const rows =
          filters.category && filters.category !== 'all'
            ? bookings.filter((b) => b.category_slug === filters.category)
            : bookings

        if (error)
          return (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )
        if (loading) return <LoadingSpinner label="Loading bookings…" />
        if (rows.length === 0)
          return (
            <EmptyState
              title={
                unassignedOnly
                  ? 'All current bookings have been assigned.'
                  : 'No bookings match your filters.'
              }
            />
          )
        return (
          <BookingTable
            bookings={rows}
            basePath="/admin/bookings"
            columns={[
              'number',
              'service',
              'client',
              'staff',
              'date',
              'amount',
              'payment',
              'status',
            ]}
          />
        )
      })()}
    </div>
  )
}
