import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { TicketTable } from '../../components/tickets/TicketTable'
import { useTicketList } from '../../hooks/useTickets'
import { countByStatus } from '../../utils/metrics'
import { APP_TAGLINE } from '../../constants'

export function Dashboard() {
  const { tickets, loading, error } = useTicketList()
  const m = countByStatus(tickets)

  const createButton = (
    <Link
      to="/tickets/new"
      className="rounded-md bg-royal px-4 py-2 text-sm font-medium text-white hover:bg-royal-dark"
    >
      Create New Ticket
    </Link>
  )

  return (
    <div>
      <PageHeader title="My Dashboard" subtitle={APP_TAGLINE} action={createButton} />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total" value={m.total} />
        <MetricCard label="Open" value={m.open + m.reopened} />
        <MetricCard label="In Progress" value={m.in_progress} />
        <MetricCard label="Waiting" value={m.waiting_for_user} />
        <MetricCard label="Resolved" value={m.resolved} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Recent Tickets
      </h2>

      {loading ? (
        <LoadingSpinner label="Loading tickets…" />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="You have not created any support tickets yet."
          action={createButton}
        />
      ) : (
        <TicketTable tickets={tickets.slice(0, 8)} />
      )}
    </div>
  )
}
