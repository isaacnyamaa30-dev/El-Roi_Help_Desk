import { PageHeader } from '../../components/common/PageHeader'
import { MetricCard } from '../../components/common/MetricCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useBookingList } from '../../hooks/useBookings'
import { countByStatus, groupBy, revenueSummary } from '../../utils/metrics'
import { formatMoney } from '../../utils/format'

export function AdminReports() {
  const { bookings, loading } = useBookingList()
  if (loading) return <LoadingSpinner label="Building reports…" />

  const m = countByStatus(bookings)
  const rev = revenueSummary(bookings)
  const cleaning = bookings.filter((b) => b.category_slug === 'cleaning').length
  const driving = bookings.filter((b) => b.category_slug === 'driving').length
  const byService = groupBy(bookings, (b) => b.service?.name ?? 'Unknown')
  const byPackage = groupBy(
    bookings.filter((b) => b.package),
    (b) => b.package!.name,
  )
  const byAgent = groupBy(
    bookings.filter((b) => b.staff),
    (b) => b.staff!.full_name,
  )
  const completedByAgent = groupBy(
    bookings.filter((b) => b.staff && b.status === 'completed'),
    (b) => b.staff!.full_name,
  )

  return (
    <div>
      <PageHeader title="Reports" subtitle="Snapshot of weekend operations" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Bookings" value={m.total} />
        <MetricCard label="Cleaning" value={cleaning} />
        <MetricCard label="Driving" value={driving} />
        <MetricCard label="Completed" value={m.completed} />
        <MetricCard label="Pending" value={m.pending} />
        <MetricCard label="Cancelled" value={m.cancelled + m.rejected} />
        <MetricCard label="Recorded Revenue" value={formatMoney(rev.recorded)} />
        <MetricCard
          label="Outstanding"
          value={formatMoney(rev.outstanding)}
          accent={rev.outstanding > 0}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Most Requested Services">
          {byService.slice(0, 8).map(([name, n]) => (
            <Row key={name} label={name} value={n} />
          ))}
        </Panel>
        <Panel title="Most Requested Cleaning Packages">
          {byPackage.length === 0 ? (
            <p className="text-sm text-gray-500">No package bookings yet.</p>
          ) : (
            byPackage.map(([name, n]) => <Row key={name} label={name} value={n} />)
          )}
        </Panel>
        <Panel title="Jobs Assigned per Worker">
          {byAgent.length === 0 ? (
            <p className="text-sm text-gray-500">No assignments yet.</p>
          ) : (
            byAgent.map(([name, n]) => <Row key={name} label={name} value={n} />)
          )}
        </Panel>
        <Panel title="Jobs Completed per Worker">
          {completedByAgent.length === 0 ? (
            <p className="text-sm text-gray-500">No completed jobs yet.</p>
          ) : (
            completedByAgent.map(([name, n]) => (
              <Row key={name} label={name} value={n} />
            ))
          )}
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
