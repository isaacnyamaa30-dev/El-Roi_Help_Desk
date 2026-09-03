import { useCallback, useEffect, useState } from 'react'
import {
  getBooking,
  listBookings,
  listBookingHistory,
  type BookingFilters,
} from '../services/bookings'
import { listPaymentsForBooking } from '../services/payments'
import type {
  BookingHistoryEntry,
  BookingWithRelations,
  Payment,
} from '../types'

interface ListState {
  bookings: BookingWithRelations[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useBookingList(filters: BookingFilters = {}): ListState {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const key = JSON.stringify(filters)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    listBookings(filters)
      .then(setBookings)
      .catch((err) => {
        console.error('[EL-ROI] Failed to load bookings:', err)
        setError('We could not load bookings. Please try again.')
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(load, [load])
  return { bookings, loading, error, reload: load }
}

interface DetailState {
  booking: BookingWithRelations | null
  history: BookingHistoryEntry[]
  payments: Payment[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useBookingDetail(id: string | undefined): DetailState {
  const [booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [history, setHistory] = useState<BookingHistoryEntry[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      getBooking(id),
      listBookingHistory(id),
      listPaymentsForBooking(id).catch(() => [] as Payment[]),
    ])
      .then(([b, h, p]) => {
        setBooking(b)
        setHistory(h)
        setPayments(p)
      })
      .catch((err) => {
        console.error('[EL-ROI] Failed to load booking:', err)
        setError(
          'This booking could not be loaded. It may not exist or you may not have access.',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(load, [load])
  return { booking, history, payments, loading, error, reload: load }
}
