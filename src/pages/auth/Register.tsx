import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { useAuth } from '../../hooks/useAuth'
import { signUp } from '../../services/auth'
import { homeForRole } from '../../components/layout/navConfig'
import {
  validateRegister,
  hasErrors,
  type RegisterInput,
  type Errors,
} from '../../utils/validation'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

const FIELDS: {
  key: keyof RegisterInput
  label: string
  type?: string
  autoComplete?: string
  placeholder?: string
}[] = [
  { key: 'fullName', label: 'Full name', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  {
    key: 'phone',
    label: 'Phone number',
    type: 'tel',
    autoComplete: 'tel',
    placeholder: '0241234567',
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
  },
  {
    key: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    autoComplete: 'new-password',
  },
]

export function Register() {
  const { session, role, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterInput>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors<RegisterInput>>({})
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to={homeForRole(role)} replace />

  function set<K extends keyof RegisterInput>(k: K, v: RegisterInput[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const found = validateRegister(form)
    setErrors(found)
    if (hasErrors(found)) return

    setBusy(true)
    try {
      const result = await signUp({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      if (result.session) navigate('/dashboard', { replace: true })
      else setDone(true)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? `Registration failed: ${err.message}`
          : 'Registration failed. Please try again.',
      )
      console.error('[EL-ROI] Registration error:', err)
    } finally {
      setBusy(false)
    }
  }

  if (done)
    return (
      <AuthLayout
        title="Check your email"
        footer={
          <Link to="/login" className="font-medium text-gold hover:underline">
            Back to login
          </Link>
        }
      >
        <p className="text-sm text-gray-600">
          Your account has been created. If email confirmation is enabled, click
          the link we sent to <span className="font-medium">{form.email}</span>{' '}
          before logging in.
        </p>
      </AuthLayout>
    )

  return (
    <AuthLayout
      title="Create an account"
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label
              htmlFor={f.key}
              className="text-sm font-medium text-gray-700"
            >
              {f.label}
            </label>
            <input
              id={f.key}
              type={f.type ?? 'text'}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              className={inputClass}
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!errors[f.key]}
            />
            {errors[f.key] && (
              <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-dark disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-xs text-gray-400">
          New accounts are created with the <strong>Client</strong> role.
        </p>
      </form>
    </AuthLayout>
  )
}
