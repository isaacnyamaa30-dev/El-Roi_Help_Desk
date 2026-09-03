import { useEffect, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../services/profiles'
import { displayRole } from '../constants'
import { formatDate } from '../utils/format'
import { isValidPhone } from '../utils/validation'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

export function Profile() {
  const { profile, session, refreshProfile } = useAuth()
  const { notify } = useToast()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name)
      setPhone(profile.phone ?? '')
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    if (fullName.trim().length < 2)
      return notify('Please enter your full name.', 'error')
    if (phone && !isValidPhone(phone))
      return notify('Enter a valid Ghana phone number.', 'error')

    setBusy(true)
    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      await refreshProfile()
      notify('Profile updated.', 'success')
    } catch (err) {
      console.error('[EL-ROI] Profile update failed:', err)
      notify('We could not update your profile. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="My Profile" />
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
      >
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="fullName"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0241234567"
          />
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-gray-700">Email</p>
            <p className="text-gray-500">{session?.user.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Role</p>
            <p className="text-gray-500">
              {displayRole(profile.role, profile.email)}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Member since</p>
            <p className="text-gray-500">{formatDate(profile.created_at)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-dark disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
