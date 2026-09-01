import { useCallback, useEffect, useState } from 'react'
import {
  getTicket,
  listHistory,
  listMessages,
  listTickets,
  type TicketFilters,
} from '../services/tickets'
import type {
  TicketHistoryEntry,
  TicketMessage,
  TicketWithPeople,
} from '../types'

interface ListState {
  tickets: TicketWithPeople[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useTicketList(
  filters: TicketFilters = {},
  sort: 'newest' | 'oldest' | 'priority' | 'updated' = 'newest',
): ListState {
  const [tickets, setTickets] = useState<TicketWithPeople[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const key = JSON.stringify({ filters, sort })

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    listTickets(filters, sort)
      .then(setTickets)
      .catch((err) => {
        console.error('[EL-ROI] Failed to load tickets:', err)
        setError('We could not load tickets. Please try again.')
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(load, [load])

  return { tickets, loading, error, reload: load }
}

interface DetailState {
  ticket: TicketWithPeople | null
  messages: TicketMessage[]
  history: TicketHistoryEntry[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useTicketDetail(id: string | undefined): DetailState {
  const [ticket, setTicket] = useState<TicketWithPeople | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [history, setHistory] = useState<TicketHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([getTicket(id), listMessages(id), listHistory(id)])
      .then(([t, m, h]) => {
        setTicket(t)
        setMessages(m)
        setHistory(h)
      })
      .catch((err) => {
        console.error('[EL-ROI] Failed to load ticket:', err)
        setError('This ticket could not be loaded. It may not exist or you may not have access.')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])

  return { ticket, messages, history, loading, error, reload: load }
}
