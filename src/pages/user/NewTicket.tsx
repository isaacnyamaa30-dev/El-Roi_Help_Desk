import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { TicketForm } from '../../components/tickets/TicketForm'
import { useToast } from '../../components/common/Toast'
import { useAuth } from '../../hooks/useAuth'
import { createTicket } from '../../services/tickets'
import type { NewTicketInput } from '../../types'

export function NewTicket() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: NewTicketInput) {
    if (!session?.user) return
    setSubmitting(true)
    try {
      const ticket = await createTicket(input, session.user.id)
      notify(`Ticket ${ticket.ticket_number} has been created successfully.`, 'success')
      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      console.error('[EL-ROI] Ticket creation failed:', err)
      notify('We could not create your ticket. Please try again.', 'error')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create a Support Ticket"
        subtitle="Tell us what you need help with and we will route it to an agent."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <TicketForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  )
}
