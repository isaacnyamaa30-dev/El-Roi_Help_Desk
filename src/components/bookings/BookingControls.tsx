import { useEffect, useState } from 'react'
import {
  BOOKING_STATUS_LABELS,
  CATEGORY_WORKER_ROLE,
  STAFF_STATUS_TRANSITIONS,
  type BookingStatus,
  type CategorySlug,
} from '../../constants'
import { listWorkers } from '../../services/profiles'
import type { Profile } from '../../types'

const selectClass =
  'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

/** Manager status control — respects the allowed transitions. */
export function StatusControl({
  status,
  onChange,
  busy,
}: {
  status: BookingStatus
  onChange: (next: BookingStatus) => void
  busy: boolean
}) {
  const options = STAFF_STATUS_TRANSITIONS[status] ?? []
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        Change status
      </label>
      <select
        className={`mt-1 ${selectClass}`}
        value=""
        disabled={busy || options.length === 0}
        onChange={(e) =>
          e.target.value && onChange(e.target.value as BookingStatus)
        }
      >
        <option value="">
          {options.length ? 'Move to…' : 'No transitions available'}
        </option>
        {options.map((s) => (
          <option key={s} value={s}>
            {BOOKING_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Assign a cleaner (cleaning bookings) or driver (driving bookings). */
export function AssignmentPanel({
  categorySlug,
  currentStaffId,
  onAssign,
  busy,
}: {
  categorySlug: CategorySlug
  currentStaffId: string | null
  onAssign: (staffId: string) => void
  busy: boolean
}) {
  const role = CATEGORY_WORKER_ROLE[categorySlug]
  const [workers, setWorkers] = useState<Profile[]>([])
  const [value, setValue] = useState(currentStaffId ?? '')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listWorkers(role)
      .then(setWorkers)
      .catch(() => setErr('Could not load workers.'))
  }, [role])

  useEffect(() => setValue(currentStaffId ?? ''), [currentStaffId])

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
        {currentStaffId ? 'Reassign' : 'Assign'}{' '}
        {role === 'cleaner' ? 'cleaner' : 'driver'}
      </label>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <div className="mt-1 flex gap-2">
        <select
          className={selectClass}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">
            Select a {role === 'cleaner' ? 'cleaner' : 'driver'}…
          </option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.full_name}
            </option>
          ))}
        </select>
        <button
          onClick={() => value && onAssign(value)}
          disabled={busy || !value || value === currentStaffId}
          className="rounded-md bg-royal px-3 py-2 text-sm font-semibold text-white transition hover:bg-royal-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Assign'}
        </button>
      </div>
      {workers.length === 0 && !err && (
        <p className="mt-1 text-xs text-gray-500">
          No active {role === 'cleaner' ? 'cleaners' : 'drivers'} available.
        </p>
      )}
    </div>
  )
}
