import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_CONTACT, APP_COPYRIGHT, APP_TAGLINE } from '../../constants'
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
    <div className="brand-navy-surface flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-white">
          <p className="font-display text-2xl font-extrabold uppercase tracking-wide">
            EL-ROI <span className="text-gold">Help Desk</span>
          </p>
          <p className="mt-1 text-sm text-blue-100/80">{APP_TAGLINE}</p>
        </Link>

        <div className="auth-card mt-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-b from-gold-light to-gold" />
          <div className="p-6">
            <h1 className="font-display text-lg font-bold text-navy">{title}</h1>

          {!isSupabaseConfigured && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Supabase is not configured. Copy <code>.env.example</code> to{' '}
              <code>.env</code> and set your project URL and anon key.
            </p>
          )}

            <div className="mt-4">{children}</div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-blue-100/80">{footer}</div>

        <p className="mt-6 text-center text-xs text-blue-100/70">
          Need help? Call{' '}
          <a href={APP_CONTACT.phoneHref} className="font-medium hover:text-gold">
            {APP_CONTACT.phoneDisplay}
          </a>{' '}
          or email{' '}
          <a href={APP_CONTACT.emailHref} className="font-medium hover:text-gold">
            {APP_CONTACT.email}
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-blue-100/50">
          {APP_COPYRIGHT}
        </p>
      </div>
    </div>
  )
}
