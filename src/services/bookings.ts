import { supabase } from '../lib/supabase'
import { BOOKING_STATUS, type BookingStatus } from '../constants'
import { paymentState } from '../utils/metrics'
import type {
  Booking,
  BookingHistoryEntry,
  BookingWithRelations,
  NewBookingInput,
} from '../types'

const BOOKING_SELECT = `
  *,
  client:profiles!bookings_client_id_fkey ( id, full_name, email, phone ),
  staff:profiles!bookings_assigned_staff_id_fkey ( id, full_name, email, phone ),
  service:services!bookings_service_id_fkey (
    id, name, category_id,
    category:service_categories!services_category_id_fkey ( slug )
  ),
  package:service_packages!bookings_package_id_fkey ( id, name )
`

function attachCategorySlug(rows: BookingWithRelations[]): BookingWithRelations[] {
  for (const b of rows) {
    const svc = b.service as unknown as {
      category?: { slug?: 'cleaning' | 'driving' }
    } | null
    b.category_slug = svc?.category?.slug ?? null
  }
  return rows
}

export interface BookingFilters {
  status?: BookingStatus | 'all'
  category?: 'cleaning' | 'driving' | 'all'
  staffId?: string | 'all' | 'unassigned'
  search?: string
  scope?: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'all'
}

/**
 * Client booking. Uses the create_booking() RPC so the price is resolved and
 * snapshotted server-side — the browser never supplies the amount.
 */
export async function createBooking(input: NewBookingInput): Promise<Booking> {
  const { data, error } = await supabase.rpc('create_booking', {
    p_service_id: input.service_id,
    p_package_id: input.package_id,
    p_pricing_option: input.pricing_option,
    p_service_date: input.service_date,
    p_service_time: input.service_time,
    p_service_location: input.service_location.trim(),
    p_client_phone: input.client_phone.trim(),
    p_instructions: input.instructions.trim(),
  })
  if (error) throw error
  return data as Booking
}

/** RLS scopes the rows: client → own, worker → assigned, staff → all. */
export async function listBookings(
  filters: BookingFilters = {},
): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .order('service_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error

  let rows = attachCategorySlug(
    await withPayments((data ?? []) as unknown as BookingWithRelations[]),
  )

  const today = new Date().toISOString().slice(0, 10)

  if (filters.scope && filters.scope !== 'all') {
    rows = rows.filter((b) => {
      switch (filters.scope) {
        case 'upcoming':
          return (
            b.service_date >= today &&
            !['completed', 'cancelled', 'rejected'].includes(b.status)
          )
        case 'active':
          return ['assigned', 'on_the_way', 'in_progress'].includes(b.status)
        case 'completed':
          return b.status === 'completed'
        case 'cancelled':
          return ['cancelled', 'rejected'].includes(b.status)
        default:
          return true
      }
    })
  }
  if (filters.status && filters.status !== 'all')
    rows = rows.filter((b) => b.status === filters.status)
  if (filters.staffId && filters.staffId !== 'all')
    rows =
      filters.staffId === 'unassigned'
        ? rows.filter((b) => !b.assigned_staff_id)
        : rows.filter((b) => b.assigned_staff_id === filters.staffId)
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    rows = rows.filter(
      (b) =>
        b.booking_number.toLowerCase().includes(q) ||
        b.client?.full_name?.toLowerCase().includes(q) ||
        b.client_phone.includes(q) ||
        b.service?.name?.toLowerCase().includes(q),
    )
  }

  return rows
}

export async function getBooking(id: string): Promise<BookingWithRelations> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return attachCategorySlug(
    await withPayments([data as unknown as BookingWithRelations]),
  )[0]
}

/** Attach a paid_total + derived payment_state to each booking. */
async function withPayments(
  bookings: BookingWithRelations[],
): Promise<BookingWithRelations[]> {
  if (bookings.length === 0) return bookings
  const ids = bookings.map((b) => b.id)
  const { data } = await supabase
    .from('payments')
    .select('booking_id, amount')
    .in('booking_id', ids)

  const paid = new Map<string, number>()
  for (const p of data ?? [])
    paid.set(p.booking_id, (paid.get(p.booking_id) ?? 0) + Number(p.amount))

  for (const b of bookings) {
    b.paid_total = paid.get(b.id) ?? 0
    b.payment_state = paymentState(b.total_amount, b.paid_total)
  }
  return bookings
}

/* --------------------------------------------------------- staff / manager */

export async function assignStaff(
  bookingId: string,
  staffId: string,
  managerId: string,
  currentStatus: BookingStatus,
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({
      assigned_staff_id: staffId,
      assigned_by: managerId,
      status:
        currentStatus === BOOKING_STATUS.PENDING ||
        currentStatus === BOOKING_STATUS.CONFIRMED
          ? BOOKING_STATUS.ASSIGNED
          : currentStatus,
    })
    .eq('id', bookingId)
  if (error) throw error
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  extra: { completion_notes?: string } = {},
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status, ...extra })
    .eq('id', bookingId)
  if (error) throw error
}

export async function updateBookingPrice(
  bookingId: string,
  totalAmount: number,
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ total_amount: totalAmount, subtotal: totalAmount })
    .eq('id', bookingId)
  if (error) throw error
}

/** Client cancels their own pending/confirmed booking. */
export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: BOOKING_STATUS.CANCELLED })
    .eq('id', bookingId)
  if (error) throw error
}

/* -------------------------------------------------------------- history */

export async function listBookingHistory(
  bookingId: string,
): Promise<BookingHistoryEntry[]> {
  const { data, error } = await supabase
    .from('booking_history')
    .select(
      '*, actor:profiles!booking_history_changed_by_fkey ( id, full_name, role )',
    )
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as BookingHistoryEntry[]
}
