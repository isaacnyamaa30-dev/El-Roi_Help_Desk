import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { homeForRole } from '../../components/layout/navConfig'
import {
  APP_AUTHOR,
  APP_COPYRIGHT,
  APP_NAME,
  APP_TAGLINE,
  APP_TAGLINE_SECONDARY,
} from '../../constants'

const FEATURES = [
  {
    title: 'Report',
    body: 'Describe your issue in a quick form and get a tracked ticket number.',
  },
  {
    title: 'Track',
    body: 'Watch your ticket move through every stage, with a full activity trail.',
  },
  {
    title: 'Resolve',
    body: 'Work with a dedicated support agent through to a confirmed fix.',
  },
]

export function Landing() {
  const { session, role, loading } = useAuth()
  if (!loading && session) return <Navigate to={homeForRole(role)} replace />

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b-2 border-gold bg-navy px-6 py-4 text-white">
        <p className="font-display text-lg font-bold uppercase tracking-wide">
          EL-ROI <span className="text-gold">Help Desk</span>
        </p>
      </header>

      {/* hero */}
      <section className="brand-navy-surface px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy">
            Help Desk Tracker
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 text-lg text-gold">{APP_TAGLINE}</p>
          <p className="mt-2 text-sm text-blue-100/80">
            {APP_TAGLINE_SECONDARY}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* three-step band — soft navy-grey so the white cards stand out */}
      <main className="flex-1 bg-mist">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="text-center font-display text-sm font-bold uppercase tracking-widest text-navy">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl border-t-4 border-green bg-white p-6 shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-gold bg-navy px-6 py-5 text-center text-xs text-blue-100/70">
        <p className="font-medium text-blue-100/90">
          {APP_NAME} · Designed &amp; developed by {APP_AUTHOR}
        </p>
        <p className="mt-1">{APP_COPYRIGHT}</p>
      </footer>
    </div>
  )
}
