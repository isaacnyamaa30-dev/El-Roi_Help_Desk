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

export function AllTickets({
  unassignedOnly = false,
}: {
  unassignedOnly?: boolean
}) {
  const [filters, setFilters] = useState<TicketFilters>(
    unassignedOnly ? { assignedTo: 'unassigned' } : {},
  )
  const [sort, setSort] = useState<SortKey>('newest')
  const { tickets, loading, error } = useTicketList(filters, sort)

  return (
    <div>
      <PageHeader
        title={unassignedOnly ? 'Unassigned Tickets' : 'All Tickets'}
        subtitle={
          unassignedOnly
            ? 'Tickets waiting to be assigned to an agent'
            : undefined
        }
      />

      {!unassignedOnly && (
        <TicketFilterBar
          filters={filters}
          sort={sort}
          onChange={setFilters}
          onSortChange={setSort}
          showAssignee
        />
      )}

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingSpinner label="Loading tickets…" />
      ) : tickets.length === 0 ? (
        <EmptyState
          title={
            unassignedOnly
              ? 'All current tickets have been assigned.'
              : 'No tickets match your filters.'
          }
        />
      ) : (
        <TicketTable
          tickets={tickets}
          basePath="/admin/tickets"
          columns={[
            'number',
            'title',
            'category',
            'priority',
            'status',
            'assignee',
            'creator',
            'created',
          ]}
        />
      )}
    </div>
  )
}
