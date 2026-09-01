import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useTicketList } from '../../hooks/useTickets'
import { countByStatus, groupBy } from '../../utils/metrics'
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_ORDER,
} from '../../constants'

export function Reports() {
  const { tickets, loading } = useTicketList()
  if (loading) return <LoadingSpinner label="Building report…" />

  const m = countByStatus(tickets)
  const byAgent = groupBy(
    tickets.filter((t) => t.assignee),
    (t) => t.assignee!.full_name,
  )
  const byCategory = groupBy(tickets, (t) => t.category)

  const resolved = tickets.filter((t) => t.resolved_at)
  const avgHours =
    resolved.length === 0
      ? null
      : Math.round(
          resolved.reduce(
            (sum, t) =>
              sum +
              (new Date(t.resolved_at!).getTime() -
                new Date(t.created_at).getTime()) /
                3_600_000,
            0,
          ) / resolved.length,
        )

  return (
    <div>
      <PageHeader title="Reports" subtitle="Snapshot of help desk activity" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Tickets" value={m.total} />
        <MetricCard label="Resolved" value={m.resolved} />
        <MetricCard label="Closed" value={m.closed} />
        <MetricCard
          label="Avg. resolution"
          value={avgHours === null ? '—' : `${avgHours}h`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="By Status">
          {TICKET_STATUS_ORDER.map((s) => (
            <Row key={s} label={TICKET_STATUS_LABELS[s]} value={m[s]} />
          ))}
        </Panel>
        <Panel title="By Agent">
          {byAgent.length === 0 ? (
            <p className="text-sm text-gray-500">No assigned tickets.</p>
          ) : (
            byAgent.map(([name, n]) => <Row key={name} label={name} value={n} />)
          )}
        </Panel>
        <Panel title="By Category">
          {byCategory.map(([cat, n]) => (
            <Row key={cat} label={cat} value={n} />
          ))}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      <ul className="space-y-1 text-sm">{children}</ul>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  )
}
