import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { PriorityBadge, StatusBadge } from '../components/common/Badges'
import { TicketConversation } from '../components/tickets/TicketConversation'
import { TicketHistory } from '../components/tickets/TicketHistory'
import {
  AgentAssignment,
  StatusControl,
} from '../components/tickets/TicketControls'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../hooks/useAuth'
import { useTicketDetail } from '../hooks/useTickets'
import {
  assignTicket,
  sendMessage,
  updateTicketStatus,
} from '../services/tickets'
import { TICKET_STATUS, type TicketStatus } from '../constants'
import { formatDateTime } from '../utils/format'

export function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { session, profile, isStaff, isAgent } = useAuth()
  const { notify } = useToast()
  const { ticket, messages, history, loading, error, reload } =
    useTicketDetail(id)
  const [busy, setBusy] = useState(false)

  if (loading) return <LoadingSpinner label="Loading ticket…" />

  if (error || !ticket)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ?? 'Ticket not found.'}
        <div className="mt-3">
          <Link to="/dashboard" className="font-medium underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )

  const userId = session!.user.id
  const canManage = isStaff
  const canChangeStatus = isStaff || (isAgent && ticket.assigned_to === userId)
  const isClosed = ticket.status === TICKET_STATUS.CLOSED
  const isTicketOwner = ticket.created_by === userId
  const canReopen =
    isTicketOwner &&
    (ticket.status === TICKET_STATUS.RESOLVED ||
      ticket.status === TICKET_STATUS.CLOSED)

  async function guard(fn: () => Promise<void>, successMsg: string) {
    setBusy(true)
    try {
      await fn()
      await reload()
      notify(successMsg, 'success')
    } catch (err) {
      console.error('[EL-ROI] Ticket action failed:', err)
      notify(
        err instanceof Error ? err.message : 'That action could not be completed.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  const handleSend = (text: string) =>
    guard(
      () => sendMessage(ticket.id, userId, text),
      'Your response has been sent.',
    )

  const handleStatus = (next: TicketStatus) =>
    guard(
      () => updateTicketStatus(ticket.id, next),
      'Ticket status updated.',
    )

  const handleAssign = (agentId: string) =>
    guard(
      () => assignTicket(ticket.id, agentId, profile!.id, ticket.status),
      'Ticket assigned.',
    )

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={ticket.title}
        subtitle={`${ticket.ticket_number} · opened ${formatDateTime(ticket.created_at)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs text-gray-500">{ticket.category}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {ticket.description}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Submitted by {ticket.creator?.full_name ?? 'Unknown'}
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Conversation
            </h2>
            <TicketConversation
              messages={messages}
              currentUserId={userId}
              onSend={handleSend}
              sending={busy}
              disabled={isClosed}
            />
          </section>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Details
            </h2>
            <dl className="space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Assigned agent</dt>
                <dd className="text-right font-medium text-gray-800">
                  {ticket.assignee?.full_name ?? 'Unassigned'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-right">{formatDateTime(ticket.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Last updated</dt>
                <dd className="text-right">{formatDateTime(ticket.updated_at)}</dd>
              </div>
              {ticket.resolved_at && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Resolved</dt>
                  <dd className="text-right">
                    {formatDateTime(ticket.resolved_at)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {(canChangeStatus || canManage || canReopen) && (
            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </h2>

              {canManage && (
                <AgentAssignment
                  currentAgentId={ticket.assigned_to}
                  onAssign={handleAssign}
                  busy={busy}
                />
              )}

              {canChangeStatus && (
                <StatusControl
                  status={ticket.status}
                  onChange={handleStatus}
                  busy={busy}
                />
              )}

              {canReopen && !canChangeStatus && (
                <button
                  onClick={() => handleStatus(TICKET_STATUS.REOPENED)}
                  disabled={busy}
                  className="w-full rounded-md border border-royal px-3 py-2 text-sm font-medium text-royal hover:bg-royal/5 disabled:opacity-60"
                >
                  Reopen ticket
                </button>
              )}
            </section>
          )}

          {(canManage || isAgent) && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                History
              </h2>
              <TicketHistory entries={history} />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
