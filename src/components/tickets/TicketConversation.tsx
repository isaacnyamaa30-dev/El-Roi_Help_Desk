import { useState } from 'react'
import { ROLE_LABELS, ROLES } from '../../constants'
import { formatDateTime, initials } from '../../utils/format'
import type { TicketMessage } from '../../types'

function MessageBubble({
  message,
  mine,
}: {
  message: TicketMessage
  mine: boolean
}) {
  const senderName = message.sender?.full_name ?? 'Unknown'
  const senderRole = message.sender?.role
  const isStaffSide =
    senderRole === ROLES.AGENT ||
    senderRole === ROLES.MANAGER ||
    senderRole === ROLES.ADMIN

  return (
    <div className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isStaffSide ? 'bg-navy text-white' : 'bg-gold text-navy'
        }`}
      >
        {initials(senderName)}
      </span>
      <div className={`max-w-[80%] ${mine ? 'text-right' : ''}`}>
        <p className="text-xs text-ink-soft">
          <span className="font-medium text-ink">{senderName}</span>
          {senderRole && senderRole !== ROLES.USER && (
            <span className="ml-1 font-medium text-green">
              · {ROLE_LABELS[senderRole]}
            </span>
          )}
          <span className="ml-1">· {formatDateTime(message.created_at)}</span>
        </p>
        <div
          className={`mt-1 inline-block whitespace-pre-wrap rounded-lg px-3 py-2 text-sm text-ink ${
            isStaffSide
              ? 'bg-navy-tint ring-1 ring-navy/10'
              : 'bg-gold-tint ring-1 ring-gold/30'
          }`}
        >
          {message.message}
        </div>
      </div>
    </div>
  )
}

export function TicketConversation({
  messages,
  currentUserId,
  onSend,
  sending,
  disabled,
}: {
  messages: TicketMessage[]
  currentUserId: string
  onSend: (text: string) => void
  sending: boolean
  disabled?: boolean
}) {
  const [text, setText] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            mine={m.sender_id === currentUserId}
          />
        ))}
      </div>

      {disabled ? (
        <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-500">
          This ticket is closed. Reopen it to continue the conversation.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor="reply" className="text-sm font-medium text-gray-700">
            Add a reply
          </label>
          <textarea
            id="reply"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
            placeholder="Type your response…"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send Response'}
          </button>
        </form>
      )}
    </div>
  )
}
