import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PriceDisplay } from '../services/PriceDisplay'
import { LoadingSpinner } from '../common/LoadingSpinner'
import {
  getCategoryCatalogue,
  lowestPrice,
  resolvePrice,
} from '../../services/catalogue'
import {
  getAvailability,
  isDateBookable,
  timeSlotsFor,
  type Availability,
} from '../../services/settings'
import {
  CATEGORY,
  MATERIAL_OPTION,
  MATERIAL_OPTION_LABELS,
  type CategorySlug,
  type MaterialOption,
} from '../../constants'
import { validateBooking, hasErrors } from '../../utils/validation'
import {
  formatMoney,
  formatServiceDate,
  formatServiceTime,
} from '../../utils/format'
import type { NewBookingInput, ServiceWithDetails } from '../../types'

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal'

const STEPS = ['Category', 'Service', 'Configure', 'Schedule', 'Details', 'Review']

export function BookingForm({
  defaultPhone,
  presetCategory,
  submitting,
  onSubmit,
}: {
  defaultPhone: string
  presetCategory?: CategorySlug
  submitting: boolean
  onSubmit: (input: NewBookingInput) => void
}) {
  const [params] = useSearchParams()
  const preselectService = params.get('service')

  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [catalogues, setCatalogues] = useState<
    Record<CategorySlug, ServiceWithDetails[]>
  >({ cleaning: [], driving: [] })

  const [step, setStep] = useState(presetCategory ? 1 : 0)
  const [category, setCategory] = useState<CategorySlug | null>(
    presetCategory ?? null,
  )
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [packageId, setPackageId] = useState<string | null>(null)
  const [materialOption, setMaterialOption] = useState<MaterialOption>(
    MATERIAL_OPTION.ELROI,
  )
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState(defaultPhone)
  const [instructions, setInstructions] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      getCategoryCatalogue(CATEGORY.CLEANING),
      getCategoryCatalogue(CATEGORY.DRIVING),
      getAvailability(),
    ])
      .then(([cleaning, driving, avail]) => {
        setCatalogues({ cleaning, driving })
        setAvailability(avail)
        if (preselectService) {
          const all = [...cleaning, ...driving]
          const svc = all.find((s) => s.id === preselectService)
          if (svc) {
            setCategory(svc.category?.slug ?? null)
            setServiceId(svc.id)
            setPackageId(svc.packages[0]?.id ?? null)
            setStep(2)
          }
        }
      })
      .catch((err) => console.error('[EL-ROI] Failed to load booking data:', err))
      .finally(() => setLoading(false))
  }, [preselectService])

  const service = useMemo(() => {
    if (!category || !serviceId) return null
    return catalogues[category].find((s) => s.id === serviceId) ?? null
  }, [category, serviceId, catalogues])

  const isCleaning = category === CATEGORY.CLEANING
  const usesMaterials =
    isCleaning &&
    (service?.prices.some(
      (p) => p.pricing_option === MATERIAL_OPTION.ELROI,
    ) ??
      false)

  const pricingOption = usesMaterials ? materialOption : null
  const price = useMemo(
    () =>
      service
        ? resolvePrice(service, packageId, pricingOption)
        : { amount: null, isQuote: true, unit: null, priceId: null },
    [service, packageId, pricingOption],
  )

  const timeSlots = useMemo(
    () => (date && availability ? timeSlotsFor(date, availability) : []),
    [date, availability],
  )
  const dateCheck =
    date && availability ? isDateBookable(date, availability) : { ok: true }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function buildInput(): NewBookingInput {
    return {
      service_id: serviceId!,
      package_id: packageId,
      pricing_option: pricingOption,
      service_date: date,
      service_time: time,
      service_location: location,
      client_phone: phone,
      instructions,
    }
  }

  function handleConfirm() {
    const found = validateBooking(buildInput())
    if (!dateCheck.ok) found.service_date = dateCheck.reason
    setErrors(found)
    if (!hasErrors(found)) onSubmit(buildInput())
  }

  if (loading) return <LoadingSpinner label="Loading services…" />

  return (
    <div>
      {/* progress */}
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded-full px-2.5 py-1 font-medium ${
              i === step
                ? 'bg-navy text-white'
                : i < step
                  ? 'bg-green-tint text-green-dark'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        {/* Step 0 — category */}
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(['cleaning', 'driving'] as CategorySlug[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c)
                  setServiceId(null)
                  setPackageId(null)
                  next()
                }}
                className={`rounded-xl border-2 p-6 text-left transition hover:border-royal ${
                  category === c ? 'border-royal bg-royal/5' : 'border-gray-200'
                }`}
              >
                <p className="font-display text-lg font-bold capitalize text-navy">
                  {c} Services
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {c === 'cleaning'
                    ? 'Weekend home, office and shop cleaning.'
                    : 'Personal, event and airport driving.'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Step 1 — service */}
        {step === 1 && category && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Choose a {category} service
            </p>
            {catalogues[category].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id)
                  setPackageId(s.packages[0]?.id ?? null)
                  next()
                }}
                className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition hover:border-royal ${
                  serviceId === s.id ? 'border-royal bg-royal/5' : 'border-gray-200'
                }`}
              >
                <div>
                  <p className="font-medium text-navy">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-ink-soft">{s.description}</p>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  {!lowestPrice(s, s.packages[0]?.id ?? null).isQuote && (
                    <span className="text-xs text-ink-soft">from</span>
                  )}
                  <PriceDisplay
                    price={lowestPrice(s, s.packages[0]?.id ?? null)}
                    size="sm"
                  />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — configure */}
        {step === 2 && service && (
          <div className="space-y-4">
            <p className="font-medium text-navy">{service.name}</p>

            {service.packages.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Package
                </label>
                <select
                  className={inputClass}
                  value={packageId ?? ''}
                  onChange={(e) => setPackageId(e.target.value || null)}
                >
                  {service.packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {usesMaterials && (
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Cleaning materials
                </legend>
                <div className="mt-2 space-y-2">
                  {(
                    [MATERIAL_OPTION.ELROI, MATERIAL_OPTION.CLIENT] as MaterialOption[]
                  ).map((opt) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${
                        materialOption === opt
                          ? 'border-royal bg-royal/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="materials"
                        checked={materialOption === opt}
                        onChange={() => setMaterialOption(opt)}
                      />
                      {MATERIAL_OPTION_LABELS[opt]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="rounded-md bg-navy-tint p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Price
              </p>
              <PriceDisplay price={price} size="lg" />
              {price.isQuote && (
                <p className="mt-1 text-xs text-ink-soft">
                  We will contact you with a quote after you submit this
                  request.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — schedule */}
        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Preferred date
              </label>
              <input
                type="date"
                className={inputClass}
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setDate(e.target.value)
                  setTime('')
                }}
              />
              {date && !dateCheck.ok && (
                <p className="mt-1 text-xs text-red-600">{dateCheck.reason}</p>
              )}
              {date && dateCheck.ok && (
                <p className="mt-1 text-xs text-green-dark">
                  {formatServiceDate(date)} — we are open.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Preferred time
              </label>
              <select
                className={inputClass}
                value={time}
                disabled={!date || !dateCheck.ok}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">Choose a time…</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {formatServiceTime(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 4 — details */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Service location
              </label>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kwadaso, Kumasi"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0241234567"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Additional instructions (optional)
              </label>
              <textarea
                rows={3}
                className={inputClass}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 5 — review */}
        {step === 5 && service && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-navy">
              Service Summary
            </h3>
            <dl className="divide-y divide-gray-100 text-sm">
              <Row k="Service" v={service.name} />
              {packageId && (
                <Row
                  k="Package"
                  v={
                    service.packages.find((p) => p.id === packageId)?.name ?? ''
                  }
                />
              )}
              {usesMaterials && (
                <Row k="Materials" v={MATERIAL_OPTION_LABELS[materialOption]} />
              )}
              <Row k="Date" v={formatServiceDate(date)} />
              <Row k="Time" v={formatServiceTime(time)} />
              <Row k="Location" v={location} />
              <Row k="Phone" v={phone} />
              <Row
                k="Price"
                v={price.isQuote ? 'Request Quote' : formatMoney(price.amount)}
              />
            </dl>
            {Object.values(errors).map((e) => (
              <p key={e} className="text-xs text-red-600">
                {e}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* nav */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={
              (step === 0 && !category) ||
              (step === 1 && !serviceId) ||
              (step === 3 && (!date || !time || !dateCheck.ok))
            }
            className="rounded-md bg-royal px-5 py-2 text-sm font-semibold text-white transition hover:bg-royal-dark disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-md bg-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-medium text-gray-800">{v}</dd>
    </div>
  )
}
