import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import { useAuth } from '../../hooks/useAuth'
import { listProfiles, setUserRole } from '../../services/profiles'
import { ROLES, ROLE_LABELS, type Role } from '../../constants'
import { formatDate } from '../../utils/format'
import type { Profile } from '../../types'

const ROLE_OPTIONS: Role[] = [
  ROLES.USER,
  ROLES.AGENT,
  ROLES.MANAGER,
  ROLES.ADMIN,
]

export function UsersAdmin() {
  const { role: myRole, profile: me } = useAuth()
  const { notify } = useToast()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const isAdmin = myRole === ROLES.ADMIN

  function load() {
    setLoading(true)
    listProfiles()
      .then(setProfiles)
      .catch((err) => console.error('[EL-ROI] Failed to load users:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function changeRole(id: string, next: Role) {
    setSavingId(id)
    try {
      await setUserRole(id, next)
      notify('Role updated.', 'success')
      load()
    } catch (err) {
      console.error('[EL-ROI] Role change failed:', err)
      notify(
        'Could not change role. Only administrators may do this.',
        'error',
      )
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading users…" />

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={
          isAdmin
            ? 'Administrators can change user roles'
            : 'Managers can view users; only administrators change roles'
        }
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {p.full_name}
                </td>
                <td className="px-4 py-3 text-gray-500">{p.email}</td>
                <td className="px-4 py-3">
                  {isAdmin && p.id !== me?.id ? (
                    <select
                      value={p.role}
                      disabled={savingId === p.id}
                      onChange={(e) =>
                        changeRole(p.id, e.target.value as Role)
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLE_LABELS[p.role]
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(p.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
