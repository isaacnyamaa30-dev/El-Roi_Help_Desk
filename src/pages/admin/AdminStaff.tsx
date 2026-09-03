import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import { useAuth } from '../../hooks/useAuth'
import {
  listStaff,
  setUserActive,
  setUserRole,
} from '../../services/profiles'
import { listBookings } from '../../services/bookings'
import { ROLES, ROLE_LABELS } from '../../constants'
import type { BookingWithRelations, Profile, Role } from '../../types'

export function AdminStaff() {
  const { role: myRole } = useAuth()
  const { notify } = useToast()
  const isAdmin = myRole === ROLES.ADMIN
  const [staff, setStaff] = useState<Profile[]>([])
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([listStaff(), listBookings()])
      .then(([s, b]) => {
        setStaff(s)
        setBookings(b)
      })
      .catch((err) => console.error('[EL-ROI] Failed to load staff:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const jobStats = (id: string) => {
    const theirs = bookings.filter((b) => b.assigned_staff_id === id)
    return {
      active: theirs.filter((b) =>
        ['assigned', 'on_the_way', 'in_progress'].includes(b.status),
      ).length,
      completed: theirs.filter((b) => b.status === 'completed').length,
    }
  }

  async function guard(fn: () => Promise<void>, id: string, msg: string) {
    setBusy(id)
    try {
      await fn()
      notify(msg, 'success')
      load()
    } catch (err) {
      console.error('[EL-ROI] Staff update failed:', err)
      notify('Only administrators can do that.', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading staff…" />

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={
          isAdmin
            ? 'Cleaners and drivers. Administrators can change roles and account status.'
            : 'Cleaners and drivers.'
        }
      />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Active Jobs</th>
              <th className="px-4 py-3 font-semibold">Completed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((p) => {
              const s = jobStats(p.id)
              return (
                <tr key={p.id} className="hover:bg-navy-tint/50">
                  <td className="px-4 py-3 font-medium text-navy">
                    {p.full_name}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={p.role}
                        disabled={busy === p.id}
                        onChange={(e) =>
                          guard(
                            () => setUserRole(p.id, e.target.value as Role),
                            p.id,
                            'Role updated.',
                          )
                        }
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                      >
                        {[ROLES.CLEANER, ROLES.DRIVER, ROLES.MANAGER].map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      ROLE_LABELS[p.role]
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3">{s.active}</td>
                  <td className="px-4 py-3">{s.completed}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_active
                          ? 'bg-green-tint text-green-dark'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={busy === p.id}
                        onClick={() =>
                          guard(
                            () => setUserActive(p.id, !p.is_active),
                            p.id,
                            'Account updated.',
                          )
                        }
                        className="rounded-md border border-royal px-2 py-1 text-xs font-medium text-royal hover:bg-royal/5 disabled:opacity-60"
                      >
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
