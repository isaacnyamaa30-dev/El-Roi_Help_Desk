import { Link } from 'react-router-dom'
import { PriceDisplay } from './PriceDisplay'
import { lowestPrice } from '../../services/catalogue'
import type { ServiceWithDetails } from '../../types'

/** A single service in a category catalogue. Shows the lowest available price. */
export function ServiceCard({ service }: { service: ServiceWithDetails }) {
  const best = lowestPrice(service)

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
