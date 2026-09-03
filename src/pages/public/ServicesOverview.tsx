import { Link } from 'react-router-dom'

const CARDS = [
  {
    slug: 'cleaning',
    emoji: '🧹',
    title: 'Cleaning Services',
    items: [
      '2, 3 & 4-bedroom home cleaning',
      'Office and shop cleaning',
      'Custom cleaning — request a quote',
      'Choose who provides the materials',
    ],
  },
  {
    slug: 'driving',
    emoji: '🚗',
    title: 'Driving Services',
    items: [
      'Personal & weekend driver',
      'Event and family driving',
      'Airport pickup and drop-off',
      'Intercity trips & vehicle delivery',
    ],
  },
]

export function ServicesOverview() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">Our Services</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Weekend cleaning and driving, made simple. Pick a category to see the
        full list and pricing.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {CARDS.map((c) => (
          <div
            key={c.slug}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <span className="text-3xl">{c.emoji}</span>
            <h2 className="mt-3 font-display text-xl font-bold text-navy">
              {c.title}
            </h2>
            <ul className="mt-3 flex-1 space-y-1 text-sm text-ink-soft">
              {c.items.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
            <Link
              to={`/services/${c.slug}`}
              className="mt-4 inline-block rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark"
            >
              View {c.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
