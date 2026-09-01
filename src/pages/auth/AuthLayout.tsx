import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import { isSupabaseConfigured } from '../../lib/supabase'

export function AuthLayout({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-white">
          <p className="text-xl font-semibold">{APP_NAME}</p>
          <p className="text-sm text-gray-300">{APP_TAGLINE}</p>
        </Link>

        <div className="mt-6 rounded-lg bg-white p-6 shadow-lg">
          <h1 className="text-lg font-semibold text-navy">{title}</h1>

          {!isSupabaseConfigured && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Supabase is not configured. Copy <code>.env.example</code> to{' '}
              <code>.env</code> and set your project URL and anon key.
            </p>
          )}

          <div className="mt-4">{children}</div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-300">{footer}</div>
      </div>
    </div>
  )
}
