import { Link } from 'react-router-dom'
import { WEEKDAY_LABELS } from '../../constants'

const STEPS = [
  {
    title: 'Create your account',
    body: 'Register with your name, email and phone number. It takes less than a minute.',
  },
  {
    title: 'Choose a service',
    body: 'Pick cleaning or driving, then the specific package. Cleaning prices update instantly when you choose who provides the materials.',
  },
  {
    title: 'Pick a date & time',
    body: `We operate on ${WEEKDAY_LABELS[6]} and ${WEEKDAY_LABELS[0]}, 9:00 AM – 8:00 PM. The calendar only lets you pick times we are open.`,
  },
  {
    title: 'Submit your booking',
    body: 'You get a booking reference like ELR-000023 straight away. Its status starts as Pending.',
  },
  {
    title: 'We confirm and assign',
    body: 'Our manager confirms your booking and assigns a cleaner or driver. You can see who is coming.',
  },
  {
    title: 'Track and pay',
    body: 'Follow your booking from On The Way to In Progress to Completed. Payment is recorded after the service.',
  },
]

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">How It Works</h1>
      <ol className="mt-8 space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-navy">
                {s.title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center">
        <Link
          to="/register"
          className="inline-block rounded-md bg-green px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-dark"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
