import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Role } from '../../constants'
import type { ReactNode } from 'react'

/**
 * Gate a route on authentication and (optionally) role.
 *
 * NOTE: this is a UX convenience only. Real authorization is enforced by
 * Supabase Row Level Security — see supabase/migrations/0002_rls_policies.sql.
 */
export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode
  allow?: Role[]
}) {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner label="Checking your session…" />

  if (!session)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allow && role && !allow.includes(role))
    return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
