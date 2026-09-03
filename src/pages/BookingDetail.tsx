import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { BookingStatusBadge, PaymentStatusBadge } from '../components/common/Badges'
import { BookingTimeline } from '../components/bookings/BookingTimeline'
import {
  AssignmentPanel,
  StatusControl,
} from '../components/bookings/BookingControls'
import { RecordPaymentForm } from '../components/payments/RecordPaymentForm'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../hooks/useAuth'
import { useBookingDetail } from '../hooks/useBookings'
import {
  assignStaff,
  cancelBooking,
  updateBookingStatus,
} from '../services/bookings'
import {
  BOOKING_STATUS,
  MATERIAL_OPTION_LABELS,
  WORKER_STATUS_ACTIONS,
  type BookingStatus,
  type MaterialOption,
} from '../constants'
import {
  formatDateTime,
  formatMoney,
  formatServiceDate,
  formatServiceTime,
} from '../utils/format'

export function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const justBooked = params.get('new') === '1'
  const { session, profile, isStaff, isWorker } = useAuth()
  const { notify } = useToast()
  const { booking, history, payments, loading, error, reload } =
    useBookingDetail(id)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  if (loading) return <LoadingSpinner label="Loading booking…" />
  if (error || !booking)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ?? 'Booking not found.'}
        <div className="mt-3">
          <Link to="/dashboard" className="font-medium underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )

  const uid = session!.user.id
  const isOwner = booking.client_id === uid
  const isMyJob = booking.assigned_staff_id === uid
  const isClosed = [
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.REJECTED,
  ].includes(booking.status as 'completed')
  const canCancel =
    isOwner &&
    [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(
      booking.status as 'pending',
    )
  const workerActions =
    isWorker && isMyJob ? WORKER_STATUS_ACTIONS[booking.status] ?? [] : []
  const paidTotal = booking.paid_total ?? 0
  const balance =
    booking.total_amount !== null
      ? Math.max(booking.total_amount - paidTotal, 0)
      : null

  async function run(fn: () => Promise<void>, msg: string) {
    setBusy(true)
    try {
      await fn()
      await reload()
      notify(msg, 'success')
    } catch (err) {
      console.error('[EL-ROI] Booking action failed:', err)
      notify(
        err instanceof Error ? err.message : 'That action could not be completed.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  const detailRows: [string, React.ReactNode][] = [
    ['Service', booking.service?.name ?? '—'],
    ...(booking.package ? ([['Package', booking.package.name]] as [string, React.ReactNode][]) : []),
    ...(booking.pricing_option && booking.pricing_option in MATERIAL_OPTION_LABELS
      ? ([
          [
            'Materials',
            MATERIAL_OPTION_LABELS[booking.pricing_option as MaterialOption],
          ],
        ] as [string, React.ReactNode][])
      : []),
    ['Date', formatServiceDate(booking.service_date)],
    ['Time', formatServiceTime(booking.service_time)],
    ['Location', booking.service_location],
    ['Phone', booking.client_phone],
    ...(isStaff || isWorker
      ? ([['Client', booking.client?.full_name ?? '—']] as [string, React.ReactNode][])
      : []),
    ['Assigned', booking.staff?.full_name ?? 'Not yet assigned'],
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={booking.service?.name ?? 'Booking'}
        subtitle={`${booking.booking_number} · booked ${formatDateTime(booking.created_at)}`}
      />

      {justBooked && (
        <div className="mb-6 rounded-lg border border-green/30 bg-green-tint p-4 text-sm text-green-dark">
          <p className="font-display text-base font-bold">Booking Confirmed</p>
          <p className="mt-1">
            Your request has been submitted successfully. Booking reference{' '}
            <span className="font-mono font-semibold">
              {booking.booking_number}
            </span>
            . Its status is <strong>Pending</strong> — our team will review and
            confirm it shortly.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              {booking.payment_state && (
                <PaymentStatusBadge status={booking.payment_state} />
              )}
            </div>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {detailRows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-800">{v}</dd>
                </div>
              ))}
            </dl>
            {booking.instructions && (
              <div className="mt-3 text-sm">
                <p className="text-gray-500">Instructions</p>
                <p className="whitespace-pre-wrap text-gray-800">
                  {booking.instructions}
                </p>
              </div>
            )}
            {booking.completion_notes && (
              <div className="mt-3 rounded-md bg-green-tint p-3 text-sm text-green-dark">
                <p className="font-medium">Completion note</p>
                <p className="whitespace-pre-wrap">{booking.completion_notes}</p>
              </div>
            )}
          </section>

          {/* worker action buttons */}
          {workerActions.length > 0 && (
            <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Update this job
              </h2>
              {booking.status === BOOKING_STATUS.IN_PROGRESS && (
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Completion note (optional) — e.g. Service completed successfully."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {workerActions.map((a) => (
                  <button
                    key={a.next}
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          updateBookingStatus(
                            booking.id,
                            a.next,
                            a.next === BOOKING_STATUS.COMPLETED && note.trim()
                              ? { completion_notes: note.trim() }
                              : {},
                          ),
                        'Job updated.',
                      )
                    }
                    className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* payments (staff + owner) */}
          {(isStaff || isOwner) && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Payments
              </h2>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-semibold text-navy">
                    {formatMoney(booking.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Paid</p>
                  <p className="font-semibold text-navy">
                    {formatMoney(paidTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Balance</p>
                  <p className="font-semibold text-navy">
                    {balance === null ? '—' : formatMoney(balance)}
                  </p>
                </div>
              </div>
              {payments.length > 0 && (
                <ul className="mt-3 divide-y divide-gray-100 text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="flex justify-between py-2">
                      <span>
                        {formatMoney(p.amount)} · {p.payment_method}
                        {p.transaction_reference
                          ? ` · ${p.transaction_reference}`
                          : ''}
                      </span>
                      <span className="text-gray-500">
                        {formatDateTime(p.payment_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {isStaff && !isClosed && booking.total_amount !== null && (
                <div className="mt-4">
                  <RecordPaymentForm
                    bookingId={booking.id}
                    total={booking.total_amount}
                    paid={paidTotal}
                    recordedBy={profile!.id}
                    onDone={reload}
                  />
                </div>
              )}
            </section>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          {(isStaff || (isWorker && isMyJob)) && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Activity
              </h2>
              <BookingTimeline entries={history} />
            </section>
          )}

          {isStaff && (
            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Manage
              </h2>
              {booking.category_slug && (
                <AssignmentPanel
                  categorySlug={booking.category_slug}
                  currentStaffId={booking.assigned_staff_id}
                  onAssign={(staffId) =>
                    run(
                      () =>
                        assignStaff(
                          booking.id,
                          staffId,
                          profile!.id,
                          booking.status,
                        ),
                      'Staff assigned.',
                    )
                  }
                  busy={busy}
                />
              )}
              <StatusControl
                status={booking.status}
                onChange={(next: BookingStatus) =>
                  run(
                    () => updateBookingStatus(booking.id, next),
                    'Status updated.',
                  )
                }
                busy={busy}
              />
            </section>
          )}

          {canCancel && (
            <button
              onClick={() =>
                run(() => cancelBooking(booking.id), 'Booking cancelled.')
              }
              disabled={busy}
              className="w-full rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              Cancel this booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
