import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { TicketTable } from '../../components/tickets/TicketTable'
import {
  TicketFilterBar,
  type SortKey,
} from '../../components/tickets/TicketFilterBar'
import { useTicketList } from '../../hooks/useTickets'
import type { TicketFilters } from '../../services/tickets'

export function MyTickets() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [sort, setSort] = useState<SortKey>('newest')
  const { tickets, loading, error } = useTicketList(filters, sort)

  return (
    <div>
      <PageHeader
        title="My Tickets"
        action={
          <Link
            to="/tickets/new"
            className="rounded-md bg-royal px-4 py-2 text-sm font-medium text-white hover:bg-royal-dark"
          >
            Create New Ticket
          </Link>
        }
      />

      <TicketFilterBar
        filters={filters}
        sort={sort}
        onChange={setFilters}
        onSortChange={setSort}
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingSpinner label="Loading tickets…" />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets match your filters." />
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  )
}
