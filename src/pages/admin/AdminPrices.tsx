import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import { listAllServices, updatePriceAmount } from '../../services/catalogue'
import {
  MATERIAL_OPTION_LABELS,
  type MaterialOption,
} from '../../constants'
import { formatMoney } from '../../utils/format'
import type { ServicePrice, ServiceWithDetails } from '../../types'

function optionLabel(price: ServicePrice, service: ServiceWithDetails): string {
  if (price.pricing_option && price.pricing_option in MATERIAL_OPTION_LABELS)
    return MATERIAL_OPTION_LABELS[price.pricing_option as MaterialOption]
  if (price.package_id) {
    const pkg = service.packages.find((p) => p.id === price.package_id)
    return pkg?.name ?? 'Package'
  }
  return price.pricing_option ?? 'Standard'
}

export function AdminPrices() {
  const { notify } = useToast()
  const [services, setServices] = useState<ServiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    listAllServices()
      .then(setServices)
      .catch((err) => console.error('[EL-ROI] Failed to load services:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function save(id: string) {
    const value = Number(draft)
    if (!value || value <= 0) {
      notify('Enter a valid amount.', 'error')
      return
    }
    setSaving(true)
    try {
      await updatePriceAmount(id, value)
      notify('Price updated. Clients will now see the new price.', 'success')
      setEditing(null)
      load()
    } catch (err) {
      console.error('[EL-ROI] Price update failed:', err)
      notify('Could not update the price.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading prices…" />

  const byCategory = new Map<string, ServiceWithDetails[]>()
  for (const s of services) {
    const key = s.category?.name ?? 'Other'
    byCategory.set(key, [...(byCategory.get(key) ?? []), s])
  }

  return (
    <div>
      <PageHeader
        title="Services & Prices"
        subtitle="Edit prices here — no code changes needed. New prices apply to new bookings; existing bookings keep their amount."
      />

      <div className="space-y-8">
        {[...byCategory.entries()].map(([cat, list]) => (
          <section key={cat}>
            <h2 className="mb-3 font-display text-lg font-bold text-navy">
              {cat}
            </h2>
            <div className="space-y-4">
              {list.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-navy">
                      {service.name}
                      {!service.active && (
                        <span className="ml-2 text-xs text-gray-400">
                          (inactive)
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-ink-soft">
                      {service.pricing_type}
                    </span>
                  </div>

                  {service.prices.length === 0 ? (
                    <p className="mt-2 text-sm text-gold-dark">
                      Request Quote — no fixed price set.
                    </p>
                  ) : (
                    <ul className="mt-2 divide-y divide-gray-100 text-sm">
                      {service.prices.map((price) => (
                        <li
                          key={price.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-2"
                        >
                          <span className="text-gray-600">
                            {optionLabel(price, service)}
                          </span>
                          {editing === price.id ? (
                            <span className="flex items-center gap-2">
                              <input
                                type="number"
                                autoFocus
                                className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                              />
                              <button
                                onClick={() => save(price.id)}
                                disabled={saving}
                                className="rounded-md bg-green px-3 py-1 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-60"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="text-xs text-gray-500"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <span className="flex items-center gap-3">
                              <span className="font-semibold text-navy">
                                {price.requires_quote || price.amount === null
                                  ? 'Request Quote'
                                  : formatMoney(price.amount)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditing(price.id)
                                  setDraft(String(price.amount ?? ''))
                                }}
                                className="rounded-md border border-royal px-2 py-1 text-xs font-medium text-royal hover:bg-royal/5"
                              >
                                Edit
                              </button>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
