import { useEffect, useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import { listAllServices, setServiceActive } from '../../services/catalogue'
import { PRICING_TYPE_LABELS } from '../../constants'
import type { ServiceWithDetails } from '../../types'

export function AdminServices() {
  const { notify } = useToast()
  const [services, setServices] = useState<ServiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  function load() {
    setLoading(true)
    listAllServices()
      .then(setServices)
      .catch((err) => console.error('[EL-ROI] Failed to load services:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function toggle(id: string, active: boolean) {
    setBusy(id)
    try {
      await setServiceActive(id, active)
      notify(active ? 'Service activated.' : 'Service deactivated.', 'success')
      load()
    } catch {
      notify('Could not update the service.', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading services…" />

  return (
    <div>
      <PageHeader
        title="Service Catalogue"
        subtitle="Activate or deactivate services. Only active services appear to clients. Edit prices on the Prices page."
      />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/15 bg-navy-tint text-xs uppercase tracking-wide text-navy">
            <tr>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Pricing</th>
              <th className="px-4 py-3 font-semibold">Packages</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-navy-tint/50">
                <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                <td className="px-4 py-3 capitalize">{s.category?.name}</td>
                <td className="px-4 py-3">
                  {PRICING_TYPE_LABELS[s.pricing_type]}
                </td>
                <td className="px-4 py-3">{s.packages.length || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.active
                        ? 'bg-green-tint text-green-dark'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={busy === s.id}
                    onClick={() => toggle(s.id, !s.active)}
                    className="rounded-md border border-royal px-2 py-1 text-xs font-medium text-royal hover:bg-royal/5 disabled:opacity-60"
                  >
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
