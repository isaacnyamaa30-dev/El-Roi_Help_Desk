import { supabase } from '../lib/supabase'
import type {
  ResolvedPrice,
  Service,
  ServiceCategory,
  ServicePackage,
  ServicePrice,
  ServiceWithDetails,
} from '../types'
import type { CategorySlug, PricingType } from '../constants'

/* --------------------------------------------------------------- categories */

export async function listCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as ServiceCategory[]
}

/* ----------------------------------------------------------------- services */

const SERVICE_SELECT = `
  *,
  category:service_categories!services_category_id_fkey ( id, name, slug ),
  packages:service_packages ( * ),
  prices:service_prices ( * )
`

/** Full catalogue for a category (client-facing — active rows only via RLS). */
export async function getCategoryCatalogue(
  slug: CategorySlug,
): Promise<ServiceWithDetails[]> {
  const { data: cat, error: catErr } = await supabase
    .from('service_categories')
    .select('id')
    .eq('slug', slug)
    .single()
  if (catErr) throw catErr

  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('category_id', cat.id)
    .order('display_order')
  if (error) throw error

  return sortDetails((data ?? []) as unknown as ServiceWithDetails[])
}

/** One service with everything attached. */
export async function getService(id: string): Promise<ServiceWithDetails> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return sortDetails([data as unknown as ServiceWithDetails])[0]
}

/** Every service (admin) — includes inactive. */
export async function listAllServices(): Promise<ServiceWithDetails[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .order('display_order')
  if (error) throw error
  return sortDetails((data ?? []) as unknown as ServiceWithDetails[])
}

function sortDetails(rows: ServiceWithDetails[]): ServiceWithDetails[] {
  for (const s of rows) {
    s.packages = (s.packages ?? []).sort(
      (a, b) => a.display_order - b.display_order,
    )
    s.prices = s.prices ?? []
  }
  return rows
}

/* ---------------------------------------------- admin service / price writes */

export async function upsertService(
  patch: Partial<Service> & { id?: string },
): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .upsert(patch)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export async function setServiceActive(
  id: string,
  active: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
  if (error) throw error
}

export async function upsertPackage(
  patch: Partial<ServicePackage> & { service_id: string; id?: string },
): Promise<ServicePackage> {
  const { data, error } = await supabase
    .from('service_packages')
    .upsert(patch)
    .select()
    .single()
  if (error) throw error
  return data as ServicePackage
}

export async function upsertPrice(
  patch: Partial<ServicePrice> & { service_id: string; id?: string },
): Promise<ServicePrice> {
  const { data, error } = await supabase
    .from('service_prices')
    .upsert(patch)
    .select()
    .single()
  if (error) throw error
  return data as ServicePrice
}

/** Admin: update just the amount of a price row. */
export async function updatePriceAmount(
  id: string,
  amount: number,
): Promise<void> {
  const { error } = await supabase
    .from('service_prices')
    .update({ amount, requires_quote: false })
    .eq('id', id)
  if (error) throw error
}

/* -------------------------------------------------------- price resolution */

/**
 * Resolve the price a client would pay for a service + package + option.
 * The DB `create_booking()` RPC does the authoritative version of this — this
 * is only for displaying the price during the booking flow.
 */
export function resolvePrice(
  service: ServiceWithDetails,
  packageId: string | null,
  pricingOption: string | null,
): ResolvedPrice {
  if (service.pricing_type === 'quote' || service.requires_quote) {
    return { amount: null, isQuote: true, unit: null, priceId: null }
  }

  const match = service.prices
    .filter(
      (p) =>
        p.active &&
        (p.package_id ?? null) === (packageId ?? null) &&
        (p.pricing_option ?? null) === (pricingOption ?? null),
    )
    .sort((a, b) => (b.valid_from ?? '').localeCompare(a.valid_from ?? ''))[0]

  if (match && !match.requires_quote && match.amount !== null) {
    return {
      amount: Number(match.amount),
      isQuote: false,
      unit: match.unit,
      priceId: match.id,
    }
  }

  // Fall back to the service base price for simple fixed services.
  if (service.base_price !== null && !service.requires_quote) {
    return {
      amount: Number(service.base_price),
      isQuote: false,
      unit: unitForPricingType(service.pricing_type),
      priceId: null,
    }
  }

  return { amount: null, isQuote: true, unit: null, priceId: null }
}

function unitForPricingType(t: PricingType): string | null {
  if (t === 'hourly') return 'per hour'
  if (t === 'daily') return 'per day'
  return null
}
