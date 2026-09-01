import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { TicketTable } from '../../components/tickets/TicketTable'
import { useTicketList } from '../../hooks/useTickets'
import { listAgents } from '../../services/profiles'
import { countByStatus, groupBy } from '../../utils/metrics'

export function AdminDashboard() {
  const { tickets, loading } = useTicketList({}, 'newest')
  const [agentCount, setAgentCount] = useState<number | null>(null)
  const m = countByStatus(tickets)

  useEffect(() => {
    listAgents()
      .then((a) => setAgentCount(a.length))
      .catch(() => setAgentCount(null))
  }, [])

  const byCategory = groupBy(tickets, (t) => t.category).slice(0, 6)
  const byPriority = groupBy(tickets, (t) => t.priority)

  return (
    <div>
      <PageHeader title="Manager / Admin Dashboard" subtitle="Help desk overview" />

      {loading ? (
        <LoadingSpinner label="Loading metrics…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard label="Total Tickets" value={m.total} />
            <MetricCard label="Open" value={m.open + m.reopened} />
            <MetricCard label="Unassigned" value={m.unassigned} accent={m.unassigned > 0} />
            <MetricCard label="Assigned" value={m.assigned} />
            <MetricCard label="In Progress" value={m.in_progress} />
            <MetricCard label="Waiting for User" value={m.waiting_for_user} />
            <MetricCard label="Resolved" value={m.resolved} />
            <MetricCard label="Closed" value={m.closed} />
            <MetricCard label="Urgent" value={m.urgent} accent={m.urgent > 0} />
            <MetricCard label="Agents" value={agentCount ?? '—'} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tickets by Category
              </h2>
              <ul className="space-y-1 text-sm">
                {byCategory.map(([cat, n]) => (
                  <li key={cat} className="flex justify-between">
                    <span className="text-gray-600">{cat}</span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tickets by Priority
              </h2>
              <ul className="space-y-1 text-sm">
                {byPriority.map(([p, n]) => (
                  <li key={p} className="flex justify-between capitalize">
                    <span className="text-gray-600">{p}</span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recently Created
          </h2>
          <TicketTable
            tickets={tickets.slice(0, 8)}
            basePath="/admin/tickets"
            columns={[
              'number',
              'title',
              'priority',
              'status',
              'assignee',
              'creator',
              'created',
            ]}
          />
        </>
      )}
    </div>
  )
}
