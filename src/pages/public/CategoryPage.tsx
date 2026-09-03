import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { ServiceCard } from '../../components/services/ServiceCard'
import { getCategoryCatalogue } from '../../services/catalogue'
import type { CategorySlug } from '../../constants'
import type { ServiceWithDetails } from '../../types'

const COPY: Record<CategorySlug, { title: string; blurb: string }> = {
  cleaning: {
    title: 'Cleaning Services',
    blurb:
      'Professional weekend cleaning. Prices below assume EL-ROI provides the materials — choose "client provides materials" during booking for a lower price.',
  },
  driving: {
    title: 'Driving Services',
    blurb:
      'Reliable weekend driving. Most driving services are quoted per trip — submit a request and we will confirm the price.',
  },
}

export function CategoryPage({ slug }: { slug: CategorySlug }) {
  const [services, setServices] = useState<ServiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getCategoryCatalogue(slug)
      .then(setServices)
      .catch((err) => console.error('[EL-ROI] Failed to load catalogue:', err))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm text-ink-soft">
        <Link to="/services" className="hover:underline">
          Services
        </Link>{' '}
        / {COPY[slug].title}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">
        {COPY[slug].title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{COPY[slug].blurb}</p>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner label="Loading services…" />
        ) : services.length === 0 ? (
          <EmptyState title="No services listed yet. Please check back soon." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
