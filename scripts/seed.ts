/* eslint-disable no-console */
/**
 * EL-ROI Services — database seed.
 *
 * Run locally only. Requires the Supabase SERVICE ROLE key, which must never
 * be exposed to the browser or committed to git.
 *
 *   npm run seed              # seed users + catalogue; bookings only if empty
 *   npm run seed -- --reset   # also wipe and re-create bookings + payments
 *
 * Creates: 1 admin, 1 manager, 3 cleaners, 3 drivers, 5 clients; the cleaning
 * and driving catalogue with the real cleaning prices; and 20+ bookings that
 * cover every status, plus payments and history.
 */

import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\nMissing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n')
  process.exit(1)
}

const reset = process.argv.includes('--reset')
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'ElRoi-Demo-2026!'

/** The business owner / super admin. Password is set separately (never a
 *  shared demo password). */
export const OWNER = {
  email: 'isaacnyamaa30@gmail.com',
  full_name: 'Isaac Nyamaa Boadi',
  phone: '+233243744689',
  role: 'admin',
} as const

const DEMO_USERS = [
  { email: 'admin@elroi.test',    full_name: 'System Administrator', phone: '+233201110001', role: 'admin' },
  { email: 'manager@elroi.test',  full_name: 'Service Manager',      phone: '+233201110002', role: 'manager' },
  { email: 'cleaner1@elroi.test', full_name: 'Ama Mensah',           phone: '+233201110011', role: 'cleaner' },
  { email: 'cleaner2@elroi.test', full_name: 'Akosua Owusu',         phone: '+233201110012', role: 'cleaner' },
  { email: 'cleaner3@elroi.test', full_name: 'Grace Asare',          phone: '+233201110013', role: 'cleaner' },
  { email: 'driver1@elroi.test',  full_name: 'Kwame Boateng',        phone: '+233201110021', role: 'driver' },
  { email: 'driver2@elroi.test',  full_name: 'Kofi Mensah',          phone: '+233201110022', role: 'driver' },
  { email: 'driver3@elroi.test',  full_name: 'Yaw Asare',            phone: '+233201110023', role: 'driver' },
  { email: 'client1@elroi.test',  full_name: 'Daniel Owusu',         phone: '+233241110031', role: 'client' },
  { email: 'client2@elroi.test',  full_name: 'Akua Frimpong',        phone: '+233241110032', role: 'client' },
  { email: 'client3@elroi.test',  full_name: 'Samuel Osei',          phone: '+233241110033', role: 'client' },
  { email: 'client4@elroi.test',  full_name: 'Abena Sarpong',        phone: '+233241110034', role: 'client' },
  { email: 'client5@elroi.test',  full_name: 'Yaw Darko',            phone: '+233241110035', role: 'client' },
] as const

type Email = (typeof DEMO_USERS)[number]['email']
const ids: Record<string, string> = {}

/** Old help-desk demo accounts that should not linger in the new app. */
const LEGACY_EMAILS = [
  'agent1@elroi.test',
  'agent2@elroi.test',
  'agent3@elroi.test',
  'user1@elroi.test',
  'user2@elroi.test',
  'user3@elroi.test',
]

async function listAllUsers() {
  const all: { id: string; email?: string }[] = []
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) throw error
    all.push(...data.users.map((u) => ({ id: u.id, email: u.email })))
    if (data.users.length < 200) break
  }
  return all
}

async function ensureUsers() {
  const existing = await listAllUsers()
  const byEmail = new Map(existing.map((u) => [u.email, u.id]))

  // Remove legacy help-desk demo accounts (auth user + any orphan profile;
  // Supabase does not always cascade the profile row).
  for (const email of LEGACY_EMAILS) {
    const id = byEmail.get(email)
    if (id) await admin.auth.admin.deleteUser(id).catch(() => {})
  }
  const { count } = await admin
    .from('profiles')
    .delete({ count: 'exact' })
    .in('email', LEGACY_EMAILS)
  if (count) console.log(`  – removed ${count} legacy demo profile(s)`)

  for (const u of DEMO_USERS) {
    let userId = byEmail.get(u.email)
    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, phone: u.phone },
      })
      if (error) throw error
      userId = data.user!.id
    }
    ids[u.email] = userId
    const { error } = await admin.from('profiles').upsert({
      id: userId,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      is_active: true,
    })
    if (error) throw error
    console.log(`  ✓ ${u.role.padEnd(8)} ${u.email}`)
  }

  // Ensure the owner exists as an admin. Never touch their password here.
  const ownerId = byEmail.get(OWNER.email)
  if (ownerId) {
    await admin.from('profiles').upsert({
      id: ownerId,
      full_name: OWNER.full_name,
      email: OWNER.email,
      phone: OWNER.phone,
      role: 'admin',
      is_active: true,
    })
    console.log(`  ✓ owner    ${OWNER.email} (admin)`)
  } else {
    console.log(
      `  ! owner ${OWNER.email} has no account yet — create it via the app or Supabase, it will be promoted to admin on the next seed`,
    )
  }
}

/* ----------------------------------------------------------------- catalogue */

async function seedCatalogue(fresh: boolean) {
  const { data: cats } = await admin.from('service_categories').select('id, slug')
  const catId = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]))

  if (fresh) {
    // Bookings are already wiped at this point, so prices/packages are safe
    // to rebuild cleanly.
    await admin.from('service_prices').delete().not('id', 'is', null)
    await admin.from('service_packages').delete().not('id', 'is', null)
  }

  const cleaning = [
    { name: '2-Bedroom Cleaning', slug: '2-bed-cleaning', pricing_type: 'package', order: 1,
      packages: ['2 Bedroom'],
      prices: [{ opt: 'elroi_materials', amt: 650 }, { opt: 'client_materials', amt: 500 }],
      desc: 'Full cleaning of a 2-bedroom home.' },
    { name: '3-Bedroom Cleaning', slug: '3-bed-cleaning', pricing_type: 'package', order: 2,
      packages: ['3 Bedroom'],
      prices: [{ opt: 'elroi_materials', amt: 1000 }, { opt: 'client_materials', amt: 700 }],
      desc: 'Full cleaning of a 3-bedroom home.' },
    { name: '4-Bedroom Cleaning', slug: '4-bed-cleaning', pricing_type: 'package', order: 3,
      packages: ['4 Bedroom'],
      prices: [{ opt: 'elroi_materials', amt: 1300 }, { opt: 'client_materials', amt: 1000 }],
      desc: 'Full cleaning of a 4-bedroom home.' },
    { name: 'Office Cleaning', slug: 'office-cleaning', pricing_type: 'quote', order: 4,
      requires_quote: true, packages: [], prices: [],
      desc: 'Weekend office cleaning — request a quote.' },
    { name: 'Custom / Other Cleaning', slug: 'custom-cleaning', pricing_type: 'quote', order: 5,
      requires_quote: true, packages: [], prices: [],
      desc: 'Anything else — tell us what you need and we will quote.' },
  ]

  const driving = [
    'Personal Driver',
    'Weekend Driver',
    'Event Driver',
    'Airport Pickup',
    'Airport Drop-off',
    'Intercity Driving',
    'Vehicle Delivery',
  ].map((name, i) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z]+/g, '-'),
    pricing_type: 'quote' as const,
    requires_quote: true,
    order: i + 1,
    desc: `${name} — submit a request and we will confirm the price.`,
  }))

  // ---- cleaning
  for (const c of cleaning) {
    const { data: svc } = await admin
      .from('services')
      .upsert(
        {
          category_id: catId.cleaning,
          name: c.name,
          slug: c.slug,
          description: c.desc,
          pricing_type: c.pricing_type,
          requires_quote: c.requires_quote ?? false,
          display_order: c.order,
          active: true,
        },
        { onConflict: 'slug' },
      )
      .select()
      .single()
    if (!svc) continue

    const pkgIds: Record<string, string> = {}
    for (const p of c.packages) {
      const { data: pkg, error: pkgErr } = await admin
        .from('service_packages')
        .upsert(
          { service_id: svc.id, name: p, active: true },
          { onConflict: 'service_id,name' },
        )
        .select('id')
        .single()
      if (pkgErr) throw pkgErr
      pkgIds[p] = pkg.id
    }

    for (const p of c.prices) {
      const packageId = c.packages.length ? pkgIds[c.packages[0]] : null
      const { data: existing } = await admin
        .from('service_prices')
        .select('id')
        .eq('service_id', svc.id)
        .eq('pricing_option', p.opt)
        .eq('active', true)
        .maybeSingle()
      if (existing) {
        await admin
          .from('service_prices')
          .update({
            amount: p.amt,
            package_id: packageId,
            requires_quote: false,
          })
          .eq('id', existing.id)
      } else {
        const { error: prErr } = await admin.from('service_prices').insert({
          service_id: svc.id,
          package_id: packageId,
          pricing_option: p.opt,
          amount: p.amt,
          active: true,
        })
        if (prErr) throw prErr
      }
    }
    console.log(`  ✓ service  ${c.name}`)
  }

  // ---- driving
  for (const d of driving) {
    await admin.from('services').upsert(
      {
        category_id: catId.driving,
        name: d.name,
        slug: d.slug,
        description: d.desc,
        pricing_type: 'quote',
        requires_quote: true,
        display_order: d.order,
        active: true,
      },
      { onConflict: 'slug' },
    )
    console.log(`  ✓ service  ${d.name}`)
  }
}

/* ----------------------------------------------------------------- bookings */

interface SeedBooking {
  client: Email
  serviceSlug: string
  packageName?: string
  option?: 'elroi_materials' | 'client_materials'
  amount: number | null
  status: string
  staff?: Email
  daysFromNow: number
  time: string
  location: string
  paid?: number
  notes?: string
}

const KUMASI = [
  'Kwadaso, Kumasi',
  'Ahodwo, Kumasi',
  'Nhyiaeso, Kumasi',
  'Asokwa, Kumasi',
  'Bomso, Kumasi',
  'Patasi, Kumasi',
]

const SEED_BOOKINGS: SeedBooking[] = [
  { client: 'client1@elroi.test', serviceSlug: '3-bed-cleaning', packageName: '3 Bedroom', option: 'elroi_materials', amount: 1000, status: 'completed', staff: 'cleaner1@elroi.test', daysFromNow: -7, time: '10:00', location: KUMASI[0], paid: 1000, notes: 'Service completed successfully. Kitchen and bathrooms deep-cleaned.' },
  { client: 'client2@elroi.test', serviceSlug: '2-bed-cleaning', packageName: '2 Bedroom', option: 'client_materials', amount: 500, status: 'completed', staff: 'cleaner2@elroi.test', daysFromNow: -6, time: '09:00', location: KUMASI[1], paid: 500 },
  { client: 'client3@elroi.test', serviceSlug: '4-bed-cleaning', packageName: '4 Bedroom', option: 'elroi_materials', amount: 1300, status: 'completed', staff: 'cleaner3@elroi.test', daysFromNow: -6, time: '11:00', location: KUMASI[2], paid: 800 },
  { client: 'client4@elroi.test', serviceSlug: 'airport-pickup', amount: null, status: 'completed', staff: 'driver1@elroi.test', daysFromNow: -5, time: '14:00', location: 'Kumasi Airport', paid: 300, notes: 'Client picked up on time.' },
  { client: 'client1@elroi.test', serviceSlug: 'weekend-driver', amount: null, status: 'completed', staff: 'driver2@elroi.test', daysFromNow: -1, time: '08:00', location: KUMASI[3] },
  { client: 'client5@elroi.test', serviceSlug: '3-bed-cleaning', packageName: '3 Bedroom', option: 'client_materials', amount: 700, status: 'awaiting_payment', staff: 'cleaner1@elroi.test', daysFromNow: 0, time: '10:00', location: KUMASI[4] },
  { client: 'client2@elroi.test', serviceSlug: '2-bed-cleaning', packageName: '2 Bedroom', option: 'elroi_materials', amount: 650, status: 'in_progress', staff: 'cleaner2@elroi.test', daysFromNow: 0, time: '09:00', location: KUMASI[5] },
  { client: 'client3@elroi.test', serviceSlug: 'personal-driver', amount: null, status: 'in_progress', staff: 'driver1@elroi.test', daysFromNow: 0, time: '12:00', location: KUMASI[0] },
  { client: 'client4@elroi.test', serviceSlug: '3-bed-cleaning', packageName: '3 Bedroom', option: 'elroi_materials', amount: 1000, status: 'on_the_way', staff: 'cleaner3@elroi.test', daysFromNow: 0, time: '13:00', location: KUMASI[1] },
  { client: 'client5@elroi.test', serviceSlug: 'event-driver', amount: null, status: 'on_the_way', staff: 'driver3@elroi.test', daysFromNow: 0, time: '16:00', location: KUMASI[2] },
  { client: 'client1@elroi.test', serviceSlug: '4-bed-cleaning', packageName: '4 Bedroom', option: 'client_materials', amount: 1000, status: 'assigned', staff: 'cleaner1@elroi.test', daysFromNow: 1, time: '10:00', location: KUMASI[3] },
  { client: 'client2@elroi.test', serviceSlug: 'airport-drop-off', amount: null, status: 'assigned', staff: 'driver2@elroi.test', daysFromNow: 1, time: '06:00', location: KUMASI[4] },
  { client: 'client3@elroi.test', serviceSlug: '2-bed-cleaning', packageName: '2 Bedroom', option: 'elroi_materials', amount: 650, status: 'confirmed', daysFromNow: 1, time: '11:00', location: KUMASI[5] },
  { client: 'client4@elroi.test', serviceSlug: 'weekend-driver', amount: null, status: 'confirmed', daysFromNow: 2, time: '08:00', location: KUMASI[0] },
  { client: 'client5@elroi.test', serviceSlug: '3-bed-cleaning', packageName: '3 Bedroom', option: 'elroi_materials', amount: 1000, status: 'pending', daysFromNow: 2, time: '09:00', location: KUMASI[1] },
  { client: 'client1@elroi.test', serviceSlug: 'intercity-driving', amount: null, status: 'pending', daysFromNow: 3, time: '07:00', location: 'Kumasi to Accra' },
  { client: 'client2@elroi.test', serviceSlug: 'office-cleaning', amount: null, status: 'pending', daysFromNow: 3, time: '15:00', location: 'Adum, Kumasi' },
  { client: 'client3@elroi.test', serviceSlug: '4-bed-cleaning', packageName: '4 Bedroom', option: 'elroi_materials', amount: 1300, status: 'pending', daysFromNow: 4, time: '10:00', location: KUMASI[2] },
  { client: 'client4@elroi.test', serviceSlug: 'personal-driver', amount: null, status: 'cancelled', daysFromNow: 5, time: '09:00', location: KUMASI[3] },
  { client: 'client5@elroi.test', serviceSlug: 'vehicle-delivery', amount: null, status: 'rejected', daysFromNow: 5, time: '10:00', location: KUMASI[4] },
  { client: 'client1@elroi.test', serviceSlug: '2-bed-cleaning', packageName: '2 Bedroom', option: 'client_materials', amount: 500, status: 'confirmed', daysFromNow: 6, time: '12:00', location: KUMASI[5] },
  { client: 'client2@elroi.test', serviceSlug: 'airport-pickup', amount: null, status: 'assigned', staff: 'driver1@elroi.test', daysFromNow: 6, time: '18:00', location: 'Kumasi Airport' },
]

function dateFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function tsFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

async function wipeBookings() {
  console.log('  wiping existing bookings (cascades to history + payments)…')
  const { error } = await admin.from('bookings').delete().not('id', 'is', null)
  if (error) throw error
}

async function seedBookings() {
  const { data: services } = await admin
    .from('services')
    .select('id, slug, packages:service_packages(id, name), prices:service_prices(id, pricing_option)')
  const svcBySlug = Object.fromEntries((services ?? []).map((s) => [s.slug, s]))

  for (const b of SEED_BOOKINGS) {
    const svc = svcBySlug[b.serviceSlug]
    if (!svc) {
      console.warn(`  ! unknown service ${b.serviceSlug}, skipping`)
      continue
    }
    const pkg = b.packageName
      ? svc.packages?.find((p: { name: string }) => p.name === b.packageName)
      : null
    const price = b.option
      ? svc.prices?.find(
          (p: { pricing_option: string }) => p.pricing_option === b.option,
        )
      : null

    const createdAt = tsFromNow(b.daysFromNow - 3)

    const { data: booking, error } = await admin
      .from('bookings')
      .insert({
        client_id: ids[b.client],
        service_id: svc.id,
        package_id: pkg?.id ?? null,
        price_id: price?.id ?? null,
        pricing_option: b.option ?? null,
        service_date: dateFromNow(b.daysFromNow),
        service_time: b.time,
        service_location: b.location,
        client_phone:
          DEMO_USERS.find((u) => u.email === b.client)?.phone ?? '0240000000',
        instructions: null,
        status: b.status,
        assigned_staff_id: b.staff ? ids[b.staff] : null,
        assigned_by: b.staff ? ids['manager@elroi.test'] : null,
        assigned_at: b.staff ? tsFromNow(b.daysFromNow - 2) : null,
        subtotal: b.amount,
        total_amount: b.amount,
        completion_notes: b.notes ?? null,
        completed_at: b.status === 'completed' ? tsFromNow(b.daysFromNow) : null,
        cancelled_at: ['cancelled', 'rejected'].includes(b.status)
          ? tsFromNow(b.daysFromNow - 1)
          : null,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select()
      .single()
    if (error) throw error

    // supplemental history
    const history: Record<string, unknown>[] = []
    if (b.staff) {
      history.push({
        booking_id: booking.id,
        action: 'booking_confirmed',
        changed_by: ids['manager@elroi.test'],
        created_at: tsFromNow(b.daysFromNow - 2.5),
      })
      history.push({
        booking_id: booking.id,
        action: 'booking_assigned',
        new_value: DEMO_USERS.find((u) => u.email === b.staff)?.full_name,
        changed_by: ids['manager@elroi.test'],
        created_at: tsFromNow(b.daysFromNow - 2),
      })
    }
    if (history.length)
      await admin.from('booking_history').insert(history)

    // payment
    if (b.paid && b.paid > 0) {
      await admin.from('payments').insert({
        booking_id: booking.id,
        amount: b.paid,
        payment_method: 'mobile_money',
        payment_status:
          b.amount && b.paid >= b.amount ? 'paid' : 'partially_paid',
        transaction_reference: `MoMo-${booking.booking_number}`,
        recorded_by: ids['manager@elroi.test'],
        payment_date: tsFromNow(b.daysFromNow),
      })
    }

    console.log(`  ✓ ${booking.booking_number}  ${svc.slug}  (${b.status})`)
  }
}

async function main() {
  console.log('\nEL-ROI Services — seeding\n')
  console.log('Users:')
  await ensureUsers()

  const { count } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  if (reset) await wipeBookings()

  console.log('\nCatalogue:')
  await seedCatalogue(reset)

  if (!reset && (count ?? 0) > 0) {
    console.log(
      `\nBookings table has ${count} rows — skipping. Use "npm run seed -- --reset" to rebuild.\n`,
    )
    return
  }

  console.log('\nBookings:')
  await seedBookings()

  console.log(`\nDone. Demo password for every account: ${DEMO_PASSWORD}\n`)
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err)
  process.exit(1)
})
