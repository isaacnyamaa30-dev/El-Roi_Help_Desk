import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { listAgents } from '../../services/profiles'
import { listTickets } from '../../services/tickets'
import type { Profile, TicketWithPeople } from '../../types'
import { TICKET_STATUS } from '../../constants'

export function AgentsList() {
  const [agents, setAgents] = useState<Profile[]>([])
  const [tickets, setTickets] = useState<TicketWithPeople[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listAgents(), listTickets()])
      .then(([a, t]) => {
        setAgents(a)
        setTickets(t)
      })
      .catch((err) => console.error('[EL-ROI] Failed to load agents:', err))
      .finally(() => setLoading(false))
  }, [])

  const workload = (agentId: string) => {
    const theirs = tickets.filter((t) => t.assigned_to === agentId)
    const open = theirs.filter(
      (t) =>
        t.status !== TICKET_STATUS.RESOLVED && t.status !== TICKET_STATUS.CLOSED,
    ).length
    return { total: theirs.length, open }
  }

  if (loading) return <LoadingSpinner label="Loading agents…" />

  return (
    <div>
      <PageHeader title="Agents" subtitle="Support agents and their current workload" />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Open Tickets</th>
              <th className="px-4 py-3 font-medium">Total Assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((a) => {
              const w = workload(a.id)
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {a.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.email}</td>
                  <td className="px-4 py-3">{w.open}</td>
                  <td className="px-4 py-3">{w.total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
