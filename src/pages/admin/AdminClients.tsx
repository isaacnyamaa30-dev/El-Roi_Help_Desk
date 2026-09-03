import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { listClients } from '../../services/profiles'
import { listBookings } from '../../services/bookings'
import { formatDate, formatServiceDate } from '../../utils/format'
import type { BookingWithRelations, Profile } from '../../types'

export function AdminClients() {
  const [clients, setClients] = useState<Profile[]>([])
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listClients(), listBookings()])
      .then(([c, b]) => {
        setClients(c)
        setBookings(b)
      })
      .catch((err) => console.error('[EL-ROI] Failed to load clients:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading clients…" />

  const stats = (id: string) => {
    const theirs = bookings.filter((b) => b.client_id === id)
    const active = theirs.filter((b) =>
      ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress'].includes(
        b.status,
      ),
    ).length
    const last = theirs
      .map((b) => b.service_date)
      .sort()
      .at(-1)
    return { total: theirs.length, active, last }
  }

  return (
    <div>
      <PageHeader title="Clients" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Bookings</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Last Service</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((c) => {
              const s = stats(c.id)
              return (
                <tr key={c.id} className="hover:bg-navy-tint/50">
                  <td className="px-4 py-3 font-medium text-navy">
                    {c.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3">{s.total}</td>
                  <td className="px-4 py-3">{s.active}</td>
                  <td className="px-4 py-3">
                    {s.last ? formatServiceDate(s.last) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
