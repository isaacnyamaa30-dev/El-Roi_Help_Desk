import { Link } from 'react-router-dom'
import { PriceDisplay } from './PriceDisplay'
import { resolvePrice } from '../../services/catalogue'
import type { ServiceWithDetails } from '../../types'

/** A single service in a category catalogue. Shows the lowest available price. */
export function ServiceCard({ service }: { service: ServiceWithDetails }) {
  // Cheapest concrete price across packages/options, else "Request Quote".
  const candidates = service.packages.length
    ? service.packages.map((p) => resolvePrice(service, p.id, defaultOption(service)))
    : [resolvePrice(service, null, defaultOption(service))]
  const concrete = candidates.filter((c) => !c.isQuote && c.amount !== null)
  const best =
    concrete.length > 0
      ? concrete.reduce((a, b) => (a.amount! <= b.amount! ? a : b))
      : candidates[0]

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-navy">{service.name}</h3>
      {service.description && (
        <p className="mt-1 flex-1 text-sm text-ink-soft">{service.description}</p>
      )}
      <div className="mt-4 flex items-end justify-between">
        <div>
          {best.isQuote ? null : (
            <span className="text-xs text-ink-soft">from</span>
          )}
          <div>
            <PriceDisplay price={best} />
          </div>
        </div>
        <Link
          to={`/book?service=${service.id}`}
          className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark"
        >
          Book
        </Link>
      </div>
    </div>
  )
}

function defaultOption(service: ServiceWithDetails): string | null {
  const opts = service.prices
    .map((p) => p.pricing_option)
    .filter((o): o is string => !!o)
  return opts[0] ?? null
}
