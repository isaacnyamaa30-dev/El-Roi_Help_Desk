import { useState } from 'react'
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

export function AgentTickets() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [sort, setSort] = useState<SortKey>('updated')
  const { tickets, loading, error } = useTicketList(filters, sort)

  return (
    <div>
      <PageHeader title="Assigned Tickets" />

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
        <EmptyState title="No tickets are currently assigned to you." />
      ) : (
        <TicketTable
          tickets={tickets}
          basePath="/agent/tickets"
          columns={[
            'number',
            'title',
            'category',
            'priority',
            'status',
            'creator',
            'updated',
          ]}
        />
      )}
    </div>
  )
}
