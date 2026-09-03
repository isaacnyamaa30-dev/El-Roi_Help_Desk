import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { homeForRole } from '../../components/layout/navConfig'
import {
  APP_NAME,
  APP_TAGLINE,
  APP_TAGLINE_SECONDARY,
  WEEKDAY_LABELS,
} from '../../constants'

const STEPS = [
  { n: 1, title: 'Book', body: 'Choose cleaning or driving, see the price, pick a date and time.' },
  { n: 2, title: 'Track', body: 'Watch your booking move from confirmed to assigned to completed.' },
  { n: 3, title: 'Serve', body: 'A dedicated cleaner or driver delivers the service and you pay after.' },
]

export function Home() {
  const { session, role, loading } = useAuth()
  if (!loading && session) return <Navigate to={homeForRole(role)} replace />

  return (
    <div>
      {/* hero */}
      <section className="brand-navy-surface px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy">
            Weekends made easy
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-5xl">
            EL-ROI
            <span className="mt-1 block text-2xl text-gold sm:text-3xl">
              Weekend Cleaning &amp; Driving Services
            </span>
          </h1>
          <p className="mt-4 text-lg text-gold">{APP_TAGLINE}</p>
          <p className="mt-2 text-sm text-blue-100/80">
            {APP_TAGLINE_SECONDARY}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Book a Service
            </Link>
            <Link
              to="/services"
              className="rounded-md border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* two service cards */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <ServiceCategoryCard
            slug="cleaning"
            title="Cleaning Services"
            body="Weekend cleaning for 2, 3 and 4-bedroom homes, offices and shops. Bring your own materials or let us provide everything."
          />
          <ServiceCategoryCard
            slug="driving"
            title="Driving Services"
            body="Personal, weekend, event and airport driving. Reliable, comfortable and on time."
          />
        </div>
      </section>

      {/* how it works */}
      <section className="bg-navy-tint px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-sm font-bold uppercase tracking-widest text-navy">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-xl border-t-4 border-green bg-white p-6 shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-base font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-soft">
            We operate on{' '}
            <span className="font-semibold text-navy">
              {WEEKDAY_LABELS[6]} &amp; {WEEKDAY_LABELS[0]}
            </span>
            , 9:00 AM – 8:00 PM.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-navy">
          Ready for a stress-free weekend?
        </h2>
        <p className="mt-2 text-ink-soft">
          Create an account and book your first {APP_NAME.includes('Cleaning') ? 'cleaning or driving' : ''}{' '}
          service in minutes.
        </p>
        <Link
          to="/register"
          className="mt-5 inline-block rounded-md bg-green px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-dark"
        >
          Get Started
        </Link>
      </section>
    </div>
  )
}

function ServiceCategoryCard({
  slug,
  title,
  body,
}: {
  slug: 'cleaning' | 'driving'
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
          slug === 'cleaning' ? 'bg-green text-white' : 'bg-navy text-white'
        }`}
      >
        {slug === 'cleaning' ? '🧹' : '🚗'}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-navy">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-ink-soft">{body}</p>
      <Link
        to={`/services/${slug}`}
        className="mt-4 inline-block text-sm font-semibold text-royal hover:underline"
      >
        View {title} →
      </Link>
    </div>
  )
}
