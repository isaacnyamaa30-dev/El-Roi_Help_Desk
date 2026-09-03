import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useToast } from '../../components/common/Toast'
import {
  listAllServices,
  listCategories,
  setServiceActive,
  upsertPackage,
  upsertService,
} from '../../services/catalogue'
import {
  PRICING_TYPE_LABELS,
  PRICING_TYPE_OPTIONS,
  type PricingType,
} from '../../constants'
import type { ServiceCategory, ServiceWithDetails } from '../../types'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AdminServices() {
  const { notify } = useToast()
  const [services, setServices] = useState<ServiceWithDetails[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    pricing_type: 'package' as PricingType,
  })
  const [pkgDraft, setPkgDraft] = useState<Record<string, string>>({})

  function load() {
    setLoading(true)
    Promise.all([listAllServices(), listCategories()])
      .then(([s, c]) => {
        setServices(s)
        setCategories(c)
        if (!form.category_id && c[0]) setForm((f) => ({ ...f, category_id: c[0].id }))
      })
      .catch((err) => console.error('[EL-ROI] Failed to load services:', err))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 3)
      return notify('Enter a service name.', 'error')
    if (!form.category_id) return notify('Choose a category.', 'error')
    setBusy('new')
    try {
      const requiresQuote = form.pricing_type === 'quote'
      await upsertService({
        name: form.name.trim(),
        slug: slugify(form.name),
        category_id: form.category_id,
        description: form.description.trim() || null,
        pricing_type: form.pricing_type,
        requires_quote: requiresQuote,
        active: true,
      })
      notify('Service added.', 'success')
      setForm((f) => ({ ...f, name: '', description: '' }))
      setShowAdd(false)
      load()
    } catch (err) {
      console.error('[EL-ROI] Add service failed:', err)
      notify(
        err instanceof Error && /duplicate/i.test(err.message)
          ? 'A service with that name already exists.'
          : 'Could not add the service.',
        'error',
      )
    } finally {
      setBusy(null)
    }
  }

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

  async function addPackage(serviceId: string) {
    const name = (pkgDraft[serviceId] ?? '').trim()
    if (!name) return
    setBusy(serviceId)
    try {
      await upsertPackage({ service_id: serviceId, name, active: true })
      setPkgDraft((d) => ({ ...d, [serviceId]: '' }))
      notify('Package added. Set its price on the Prices page.', 'success')
      load()
    } catch (err) {
      console.error('[EL-ROI] Add package failed:', err)
      notify('Could not add the package (it may already exist).', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading services…" />

  return (
    <div>
      <PageHeader
        title="Service Catalogue"
        subtitle="Add services and packages here; set amounts on the Prices page. Only active services appear to clients."
        action={
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark"
          >
            <Plus className="h-4 w-4" />
            {showAdd ? 'Close' : 'Add Service'}
          </button>
        }
      />

      {showAdd && (
        <form
          onSubmit={addService}
          className="mb-6 grid gap-4 rounded-lg border border-green/30 bg-green-tint/40 p-5 sm:grid-cols-2"
        >
          <label className="text-sm font-medium text-gray-700">
            Service name
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Deep Kitchen Cleaning"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Category
            <select
              className={inputClass}
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Pricing type
            <select
              className={inputClass}
              value={form.pricing_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  pricing_type: e.target.value as PricingType,
                })
              }
            >
              {PRICING_TYPE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PRICING_TYPE_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Description
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Shown to clients on the catalogue"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy === 'new'}
              className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
            >
              {busy === 'new' ? 'Adding…' : 'Add Service'}
            </button>
            <span className="ml-3 text-xs text-ink-soft">
              Package-priced services (like room-size cleaning) need a package
              and a price added afterwards.
            </span>
          </div>
        </form>
      )}

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
              <tr key={s.id} className="align-top hover:bg-navy-tint/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-ink-soft">{s.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{s.category?.name}</td>
                <td className="px-4 py-3">
                  {PRICING_TYPE_LABELS[s.pricing_type]}
                </td>
                <td className="px-4 py-3">
                  {s.packages.length > 0 && (
                    <ul className="mb-1 space-y-0.5 text-xs text-gray-600">
                      {s.packages.map((p) => (
                        <li key={p.id}>• {p.name}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-1">
                    <input
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
                      placeholder="Add package"
                      value={pkgDraft[s.id] ?? ''}
                      onChange={(e) =>
                        setPkgDraft((d) => ({ ...d, [s.id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => addPackage(s.id)}
                      disabled={busy === s.id || !(pkgDraft[s.id] ?? '').trim()}
                      className="rounded bg-royal px-2 py-1 text-xs font-medium text-white hover:bg-royal-dark disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </td>
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
                  <div className="flex flex-col items-end gap-1">
                    <button
                      disabled={busy === s.id}
                      onClick={() => toggle(s.id, !s.active)}
                      className="rounded-md border border-royal px-2 py-1 text-xs font-medium text-royal hover:bg-royal/5 disabled:opacity-60"
                    >
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to="/admin/prices"
                      className="text-xs text-royal hover:underline"
                    >
                      Set prices →
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
