import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { useAuth } from '../../hooks/useAuth'
import { signIn } from '../../services/auth'
import { homeForRole } from '../../components/layout/navConfig'
import { validateLogin, hasErrors } from '../../utils/validation'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

export function Login() {
  const { session, role, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to={homeForRole(role)} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const found = validateLogin({ email, password })
    setErrors(found)
    if (hasErrors(found)) return

    setBusy(true)
    try {
      await signIn(email, password)
      const dest =
        (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error
          ? 'Login failed. Please check your email and password.'
          : 'Something went wrong. Please try again.',
      )
      console.error('[EL-ROI] Login error:', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Log in"
      footer={
        <>
          Need an account?{' '}
          <Link to="/register" className="font-medium text-gold hover:underline">
            Register
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
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-royal px-4 py-2 text-sm font-medium text-white hover:bg-royal-dark disabled:opacity-60"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
