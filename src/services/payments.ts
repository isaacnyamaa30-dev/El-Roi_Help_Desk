import { supabase } from '../lib/supabase'
import type { PaymentMethod, PaymentStatus } from '../constants'
import type { Payment } from '../types'

export interface RecordPaymentInput {
  bookingId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  notes?: string
  recordedBy: string
}

export async function recordPayment(
  input: RecordPaymentInput,
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      booking_id: input.bookingId,
      amount: input.amount,
      payment_method: input.method,
      payment_status: input.status,
      transaction_reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
      recorded_by: input.recordedBy,
    })
    .select()
    .single()
  if (error) throw error
  return data as Payment
}

export async function listPaymentsForBooking(
  bookingId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('payment_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Payment[]
}

/** Admin payments page — every payment with its booking. */
export async function listAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      '*, booking:bookings!payments_booking_id_fkey ( id, booking_number, total_amount )',
    )
    .order('payment_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Payment[]
}
