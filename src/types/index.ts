import type {
  BookingStatus,
  CategorySlug,
  PaymentMethod,
  PaymentStatus,
  PricingType,
  Role,
} from '../constants'

export type { BookingStatus, PaymentMethod, PaymentStatus, PricingType, Role }

/** Row from `profiles`. */
export interface Profile {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: Role
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Row from `service_categories`. */
export interface ServiceCategory {
  id: string
  name: string
  slug: CategorySlug
  description: string | null
  icon: string | null
  active: boolean
  created_at: string
  updated_at: string
}

/** Row from `services`. */
export interface Service {
  id: string
  category_id: string
  name: string
  slug: string | null
  description: string | null
  pricing_type: PricingType
  base_price: number | null
  requires_quote: boolean
  estimated_duration_minutes: number | null
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/** Row from `service_packages`. */
export interface ServicePackage {
  id: string
  service_id: string
  name: string
  description: string | null
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/** Row from `service_prices`. */
export interface ServicePrice {
  id: string
  service_id: string
  package_id: string | null
  pricing_option: string | null
  amount: number | null
  unit: string | null
  requires_quote: boolean
  active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

/** A service with its packages and prices attached — used by the catalogue. */
export interface ServiceWithDetails extends Service {
  category: Pick<ServiceCategory, 'id' | 'name' | 'slug'> | null
  packages: ServicePackage[]
  prices: ServicePrice[]
}

/** Row from `bookings`. */
export interface Booking {
  id: string
  booking_number: string
  client_id: string
  service_id: string
  package_id: string | null
  price_id: string | null
  pricing_option: string | null
  service_date: string
  service_time: string
  service_location: string
  client_phone: string
  instructions: string | null
  status: BookingStatus
  assigned_staff_id: string | null
  assigned_by: string | null
  assigned_at: string | null
  quoted_amount: number | null
  subtotal: number | null
  total_amount: number | null
  completion_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  cancelled_at: string | null
}

type Person = Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>

/** Booking joined with the rows it references. */
export interface BookingWithRelations extends Booking {
  client: Person | null
  staff: Person | null
  service: Pick<Service, 'id' | 'name' | 'category_id'> | null
  package: Pick<ServicePackage, 'id' | 'name'> | null
  category_slug?: CategorySlug | null
  paid_total?: number
  payment_state?: PaymentStatus
}

/** Row from `booking_history`. */
export interface BookingHistoryEntry {
  id: string
  booking_id: string
  action: string
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  actor?: Pick<Profile, 'id' | 'full_name' | 'role'> | null
}

/** Row from `payments`. */
export interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_reference: string | null
  notes: string | null
  recorded_by: string | null
  payment_date: string
  created_at: string
  booking?: Pick<Booking, 'id' | 'booking_number' | 'total_amount'> | null
}

/** Row from `business_settings`. */
export interface BusinessSettings {
  id: string
  business_name: string
  short_name: string
  phone: string | null
  email: string | null
  currency: string
  timezone: string
  opening_time: string
  closing_time: string
  booking_slot_minutes: number
  booking_enabled: boolean
  created_at: string
  updated_at: string
}

/** Row from `working_days`. */
export interface WorkingDay {
  id: string
  day_of_week: number
  enabled: boolean
  opening_time: string
  closing_time: string
}

/** Row from `blackout_dates`. */
export interface BlackoutDate {
  id: string
  date: string
  reason: string | null
  created_at: string
}

/** Input passed to the `create_booking` RPC. */
export interface NewBookingInput {
  service_id: string
  package_id: string | null
  pricing_option: string | null
  service_date: string
  service_time: string
  service_location: string
  client_phone: string
  instructions: string
}

/** Resolved price for a service/package/option selection. */
export interface ResolvedPrice {
  amount: number | null
  isQuote: boolean
  unit: string | null
  priceId: string | null
}
