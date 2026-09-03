import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import {
  addBlackoutDate,
  getBlackoutDates,
  getBusinessSettings,
  getWorkingDays,
  removeBlackoutDate,
  setWorkingDay,
  updateBusinessSettings,
} from '../../services/settings'
import { WEEKDAY_LABELS } from '../../constants'
import { formatServiceDate, todayISO } from '../../utils/format'
import type { BlackoutDate, BusinessSettings, WorkingDay } from '../../types'

export function AdminSettings() {
  const { notify } = useToast()
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [days, setDays] = useState<WorkingDay[]>([])
  const [blackout, setBlackout] = useState<BlackoutDate[]>([])
  const [loading, setLoading] = useState(true)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')

  function load() {
    setLoading(true)
    Promise.all([getBusinessSettings(), getWorkingDays(), getBlackoutDates()])
      .then(([s, d, b]) => {
        setSettings(s)
        setDays(d)
        setBlackout(b)
      })
      .catch((err) => console.error('[EL-ROI] Failed to load settings:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function saveHours(patch: Partial<BusinessSettings>) {
    if (!settings) return
    try {
      await updateBusinessSettings(settings.id, patch)
      setSettings({ ...settings, ...patch })
      notify('Settings saved.', 'success')
    } catch {
      notify('Could not save settings.', 'error')
    }
  }

  async function toggleDay(day: WorkingDay) {
    try {
      await setWorkingDay(day.day_of_week, { enabled: !day.enabled })
      load()
    } catch {
      notify('Could not update working days.', 'error')
    }
  }

  async function addBlackout(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate) return
    try {
      await addBlackoutDate(newDate, newReason)
      setNewDate('')
      setNewReason('')
      notify('Blackout date added.', 'success')
      load()
    } catch {
      notify('Could not add that date (it may already exist).', 'error')
    }
  }

  if (loading || !settings) return <LoadingSpinner label="Loading settings…" />

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Settings" subtitle="Operating days, hours and closures" />

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-display font-bold text-navy">Operating hours</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            Opening time
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              defaultValue={settings.opening_time.slice(0, 5)}
              onBlur={(e) => saveHours({ opening_time: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Closing time
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              defaultValue={settings.closing_time.slice(0, 5)}
              onBlur={(e) => saveHours({ closing_time: e.target.value })}
            />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.booking_enabled}
            onChange={(e) => saveHours({ booking_enabled: e.target.checked })}
          />
          Online booking is enabled
        </label>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-display font-bold text-navy">Working days</h2>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              key={d.day_of_week}
              onClick={() => toggleDay(d)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                d.enabled
                  ? 'bg-green text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {WEEKDAY_LABELS[d.day_of_week]}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-display font-bold text-navy">
          Blackout dates
        </h2>
        <form onSubmit={addBlackout} className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            Date
            <input
              type="date"
              min={todayISO()}
              className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>
          <label className="flex-1 text-sm">
            Reason
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Public holiday"
            />
          </label>
          <button className="rounded-md bg-royal px-3 py-2 text-sm font-semibold text-white hover:bg-royal-dark">
            Add
          </button>
        </form>
        {blackout.length > 0 && (
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {blackout.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2">
                <span>
                  {formatServiceDate(b.date)}
                  {b.reason ? ` — ${b.reason}` : ''}
                </span>
                <button
                  onClick={() =>
                    removeBlackoutDate(b.id).then(load).catch(() => {})
                  }
                  className="text-xs text-rose-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
