import { useEffect, useState } from 'react'
import {
  STATUS_TRANSITIONS,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from '../../constants'
import { listAgents } from '../../services/profiles'
import type { Profile } from '../../types'

const selectClass =
  'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

/** Status transition control for agents / staff. */
export function StatusControl({
  status,
  onChange,
  busy,
}: {
  status: TicketStatus
  onChange: (next: TicketStatus) => void
  busy: boolean
}) {
  const options = STATUS_TRANSITIONS[status] ?? []
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Change status
      </label>
      <select
        className={`mt-1 ${selectClass}`}
        value=""
        disabled={busy || options.length === 0}
        onChange={(e) => e.target.value && onChange(e.target.value as TicketStatus)}
      >
        <option value="">
          {options.length ? 'Move to…' : 'No transitions available'}
        </option>
        {options.map((s) => (
          <option key={s} value={s}>
            {TICKET_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Agent assignment dropdown for managers / admins. */
export function AgentAssignment({
  currentAgentId,
  onAssign,
  busy,
}: {
  currentAgentId: string | null
  onAssign: (agentId: string) => void
  busy: boolean
}) {
  const [agents, setAgents] = useState<Profile[]>([])
  const [value, setValue] = useState(currentAgentId ?? '')

  useEffect(() => {
    listAgents()
      .then(setAgents)
      .catch((err) => console.error('[EL-ROI] Failed to load agents:', err))
  }, [])

  useEffect(() => setValue(currentAgentId ?? ''), [currentAgentId])

  return (
    <div>
      <label
        htmlFor="assign-agent"
        className="block text-xs font-medium uppercase tracking-wide text-gray-500"
      >
        {currentAgentId ? 'Reassign agent' : 'Assign agent'}
      </label>
      <div className="mt-1 flex gap-2">
        <select
          id="assign-agent"
          className={selectClass}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Select an agent…</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
        <button
          onClick={() => value && onAssign(value)}
          disabled={busy || !value || value === currentAgentId}
          className="rounded-md bg-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Assign'}
        </button>
      </div>
    </div>
  )
}
