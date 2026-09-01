import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { homeForRole } from '../../components/layout/navConfig'
import {
  APP_NAME,
  APP_TAGLINE,
  APP_TAGLINE_SECONDARY,
} from '../../constants'

export function Landing() {
  const { session, role, loading } = useAuth()
  if (!loading && session) return <Navigate to={homeForRole(role)} replace />

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-navy px-6 py-4 text-white">
        <p className="text-lg font-semibold">{APP_NAME}</p>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-navy sm:text-4xl">{APP_NAME}</h1>
        <p className="mt-3 text-lg text-royal">{APP_TAGLINE}</p>
        <p className="mt-1 text-sm text-gray-500">{APP_TAGLINE_SECONDARY}</p>

        <p className="mt-6 max-w-xl text-gray-600">
          Report an issue, track its progress, and work with a support agent
          through to resolution — every action recorded along the way.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            to="/login"
            className="rounded-md bg-royal px-5 py-2.5 text-sm font-medium text-white hover:bg-royal-dark"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-royal px-5 py-2.5 text-sm font-medium text-royal hover:bg-royal/5"
          >
            Create an account
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        {APP_NAME}
      </footer>
    </div>
  )
}
