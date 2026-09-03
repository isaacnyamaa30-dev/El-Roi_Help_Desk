import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { BookingForm } from '../../components/bookings/BookingForm'
import { useToast } from '../../components/common/Toast'
import { useAuth } from '../../hooks/useAuth'
import { createBooking } from '../../services/bookings'
import type { CategorySlug } from '../../constants'
import type { NewBookingInput } from '../../types'

export function BookService({
  presetCategory,
}: {
  presetCategory?: CategorySlug
}) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(input: NewBookingInput) {
    if (!navigator.onLine) {
      notify(
        'You are currently offline. Please reconnect to submit your booking.',
        'error',
      )
      return
    }
    setSubmitting(true)
    try {
      const booking = await createBooking(input)
      navigate(`/bookings/${booking.id}?new=1`, { replace: true })
    } catch (err) {
      console.error('[EL-ROI] Booking failed:', err)
      notify(
        err instanceof Error
          ? `We could not submit your booking: ${err.message}`
          : 'We could not submit your booking. Please check your connection and try again.',
        'error',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Book a Service"
        subtitle="A few quick steps and we'll take it from there."
      />
      <BookingForm
        defaultPhone={profile?.phone ?? ''}
        presetCategory={presetCategory}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
