import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { TicketTable } from '../../components/tickets/TicketTable'
import { useTicketList } from '../../hooks/useTickets'
import { countByStatus } from '../../utils/metrics'

export function AgentDashboard() {
  // RLS already limits this list to tickets assigned to the current agent.
  const { tickets, loading, error } = useTicketList({}, 'updated')
  const m = countByStatus(tickets)

  return (
    <div>
      <PageHeader
        title="Agent Dashboard"
        subtitle="Tickets currently assigned to you"
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total Assigned" value={m.total} />
        <MetricCard label="Assigned" value={m.assigned} />
        <MetricCard label="In Progress" value={m.in_progress} />
        <MetricCard label="Waiting for User" value={m.waiting_for_user} />
        <MetricCard label="Resolved" value={m.resolved} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        My Assigned Tickets
      </h2>

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
