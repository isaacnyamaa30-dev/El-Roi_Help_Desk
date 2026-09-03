# EL-ROI Weekend Cleaning And Driving Services Tracker

**Book. Track. Serve.**

_Designed and developed by **Isaac Nyamaa Boadi**. © 2026 Isaac Nyamaa Boadi.
All Rights Reserved. See [LICENSE](./LICENSE)._

**Contact / service enquiries:** +233 24 374 4689 (call / WhatsApp) ·
isaacnyamaa30@gmail.com

A service-management web app (installable as a PWA) for **EL-ROI Weekend
Cleaning And Driving Services** in Kumasi, Ghana. Clients book cleaning or
driving services, see the price up front, and track the job from *Pending*
to *Completed*; managers confirm bookings and assign cleaners/drivers;
workers update job status; admins manage the service catalogue, prices,
staff and payments.

Built as a classroom project — small enough to trace end to end, structured
like a real app.

---

## 1. What it does

```
Client → Select Service → View Price → Book → Manager Approval →
Staff Assignment → Service Delivery → Payment → Completion
```

- **Clients** register, browse Cleaning / Driving services, pick a package
  and (for cleaning) who provides the materials, choose a weekend date and
  time, book, and track every status change.
- **Managers** see all bookings, confirm or reject, assign a **cleaner** to
  cleaning jobs and a **driver** to driving jobs, change status, and record
  payments.
- **Cleaners / Drivers** see only the jobs assigned to them and move each
  one through *Assigned → On The Way → In Progress → Completed*.
- **Admins** additionally manage the service catalogue, **edit prices
  without touching code**, activate/deactivate staff, and change operating
  days/hours and blackout dates.

Every important change is written to a **booking history** audit trail.

---

## 2. Technology stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 · Vite · TypeScript · React Router · Tailwind CSS · lucide-react |
| Backend | Supabase — PostgreSQL, Auth, Row Level Security, Data API |
| Installable app | `vite-plugin-pwa` + Workbox (manifest, service worker, offline shell, update prompt) |
| Version control | Git · GitHub |
| Hosting | Vercel (auto-deploy on push to `main`) |

---

## 3. Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) account
- A [GitHub](https://github.com/) account and a [Vercel](https://vercel.com/) account (for deployment)

---

## 4. Local setup

```bash
git clone <your-repo-url>
cd el-roi-help-desk
npm install
cp .env.example .env      # then fill in your Supabase values
npm run dev               # http://localhost:5173
```

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser + scripts | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | browser + scripts | The **anon / publishable** key. Safe in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | **seed + migrations only** | The **service_role** secret. Never commit it, never ship it to the browser. |
| `SUPABASE_PROJECT_REF` | migration runner | your project ref (the sub-domain) |
| `SUPABASE_DB_PASSWORD` | migration runner | database password — lets `npm run db:migrate` connect without the Supabase CLI |

`.env` is git-ignored; only `.env.example` is committed.

---

## 5. Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. Apply the migrations (in order). Two options:
   - **Migration runner (no CLI):** put `SUPABASE_PROJECT_REF` and
     `SUPABASE_DB_PASSWORD` in `.env`, then `npm run db:migrate`.
   - **SQL editor:** paste each `supabase/migrations/*.sql` file in order.
3. Copy the **Project URL** and **anon key** into `.env`.
4. **Auth → Providers → Email**: keep enabled. For a smooth classroom demo
   turn *Confirm email* **off** so new registrations log in immediately.
5. **Auth → URL Configuration**: set **Site URL** to
   `http://localhost:5173` now; add your Vercel URL / custom domain later.

### What the migrations create

| File | Contents |
| --- | --- |
| `0003` | `service_categories`, `services`, `service_packages`, `service_prices`, `business_settings`, `working_days` (Sat + Sun on), `blackout_dates` |
| `0004` | `profiles` gains `phone`; roles → `client / cleaner / driver / manager / admin`; signup trigger creates **clients** |
| `0005` | `bookings` (`ELR-######` numbers from a sequence), auto `booking_history`, `payments`, guard triggers, and the `create_booking()` RPC |
| `0006` | Row Level Security for every table |
| `0007` | natural-key uniqueness for packages/prices |
| `0008` | forgiving server-side price matching in `create_booking()` |
| `0009` | drops the legacy help-desk tables this project grew from |

---

## 6. Seed data

```bash
# .env needs VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run seed              # users + catalogue; bookings only if none exist
npm run seed -- --reset   # also wipe + rebuild bookings, payments, history
```

Creates 1 admin, 1 manager, 3 cleaners, 3 drivers, 5 clients, the full
Cleaning + Driving catalogue (with the real cleaning prices), and 22
bookings covering every status, plus payments and history.

### Demo accounts

> **Demo credentials are for local / classroom use only. Never use them in
> production.**

Password for **every** demo account: `ElRoi#Demo2024`

| Email | Role | Name |
| --- | --- | --- |
| `admin@elroi.test` | admin | System Administrator |
| `manager@elroi.test` | manager | Service Manager |
| `cleaner1@elroi.test` … `cleaner3@elroi.test` | cleaner | Ama Mensah, Akosua Owusu, Grace Asare |
| `driver1@elroi.test` … `driver3@elroi.test` | driver | Kwame Boateng, Kofi Mensah, Yaw Asare |
| `client1@elroi.test` … `client5@elroi.test` | client | Daniel Owusu, Akua Frimpong, Samuel Osei, Abena Sarpong, Yaw Darko |

### Cleaning prices (editable later by an admin at `/admin/prices`)

| Service | EL-ROI materials | Client materials |
| --- | --- | --- |
| 2-Bedroom | GH₵650 | GH₵500 |
| 3-Bedroom | GH₵1,000 | GH₵700 |
| 4-Bedroom | GH₵1,300 | GH₵1,000 |

Driving services are **Request Quote** by default — set a real price in the
admin once the business confirms one.

---

## 7. Install the app (PWA)

- **Android / Chrome / Edge:** tap **Install app** on the landing page, or
  the browser menu → *Install* / *Add to Home screen*.
- **Desktop Chrome / Edge:** the install icon in the address bar.
- **iPhone / iPad (Safari):** **Share → Add to Home Screen**.

Installed, it opens in its own window as **EL-ROI Services**, caches the app
shell so it starts instantly, and shows an **"Update Now"** banner when a new
version is deployed. Bookings are **not** submitted offline — you get a
"reconnect to submit" message instead of silently losing the booking.

---

## 8. Project structure

```text
src/
├── components/
│   ├── common/     LoadingSpinner, EmptyState, Toast, Badges, MetricCard,
│   │               PageHeader, InstallButton, PwaManager, ConfirmDialog
│   ├── layout/     AppShell, ProtectedRoute, navConfig
│   ├── bookings/   BookingForm (wizard), BookingTable, BookingTimeline, BookingControls
│   ├── services/   ServiceCard, PriceDisplay
│   └── payments/   RecordPaymentForm
├── pages/
│   ├── public/     PublicLayout, Home, ServicesOverview, CategoryPage, HowItWorks
│   ├── auth/       AuthLayout, Login, Register
│   ├── client/     ClientDashboard, BookService, MyBookings, ClientPayments
│   ├── staff/      StaffDashboard, StaffJobs
│   ├── admin/      AdminDashboard, AdminBookings, AdminCalendar, AdminServices,
│   │               AdminPrices, AdminClients, AdminStaff, AdminPayments,
│   │               AdminReports, AdminSettings
│   ├── BookingDetail.tsx   (shared by client / staff / admin)
│   └── Profile.tsx
├── hooks/          useAuth, useBookings, useInstallPrompt
├── services/       catalogue, bookings, payments, settings, profiles, auth
├── constants/      roles, booking + payment statuses, pricing types, currency
├── types/          row types aligned with the DB schema
└── utils/          format (GH₵, dates), validation, metrics

supabase/migrations/   0001 … 0009
scripts/               db.ts (migration runner), seed.ts
```

---

## 9. Deployment (GitHub + Vercel)

1. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In Vercel: **Add New → Project**, import the repo. Framework preset
   **Vite** is auto-detected (build `npm run build`, output `dist`).
3. Add env vars **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** (do
   **not** add the service role key).
4. In Vercel → **Settings → Git**, connect the repo so every push to `main`
   auto-deploys.
5. `vercel.json` rewrites every path to `/index.html` — deep links like
   `/bookings/<uuid>` and `/admin/prices` work on refresh.
6. In Supabase → **Auth → URL Configuration**, add the
   `https://<project>.vercel.app` URL to **Site URL** / **Redirect URLs**.

---

## 10. Updating production

```bash
# edit code
npm run dev            # verify locally
git commit -am "…" && git push   # Vercel auto-deploys in ~1–2 min
```

Installed PWA users get an **Update Now** banner on their next visit.

---

## 11. Custom domain

To serve the app from e.g. `services.elroi.com`:

1. Vercel → **Settings → Domains → Add**.
2. At your DNS provider add the record Vercel shows (`CNAME` →
   `cname.vercel-dns.com` for a subdomain).
3. Wait for verification; Vercel issues the HTTPS certificate automatically.
4. In Supabase → **Auth → URL Configuration**, set **Site URL** to the
   custom domain and add it to **Redirect URLs**.

No production URL is hard-coded — the app uses `window.location.origin` and
the environment variables.

---

## 12. Debugging guide

The app is structured so you can trace one action through every layer:

```
CLIENT ACTION → REACT COMPONENT → VALIDATION → SERVICE FUNCTION →
SUPABASE API → RLS → POSTGRESQL → RESPONSE → UPDATED UI
```

**Create a booking:**

| Layer | Where |
| --- | --- |
| React wizard | `components/bookings/BookingForm.tsx` |
| Service call | `services/bookings.ts` → `createBooking()` → the `create_booking` RPC |
| Authorization / price | the `create_booking()` function in `0005` / `0008` — resolves the price **server-side** and snapshots it onto `bookings.total_amount` |
| Database | Supabase → Table editor → `bookings` (+ a `booking_history` row from the trigger) |
| UI update | redirect to `/bookings/:id?new=1` with the "Booking Confirmed" banner |

### Common problems

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Supabase is not configured" | missing `.env` values | set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, restart `npm run dev` |
| Works locally, fails on Vercel | env vars not set in Vercel | add them, redeploy |
| Client books but can't see the booking | RLS `bookings_select` wrong/missing | re-run `0006` |
| Cleaner dropdown is empty when assigning | wrong role query, or no active cleaners | check `profiles.role`; the dropdown filters `cleaner` for cleaning, `driver` for driving |
| Price shows "Request Quote" unexpectedly | no active `service_prices` row for that service/package/option | add one at `/admin/prices` |
| Refreshing `/admin/prices` gives 404 | SPA rewrite missing | ensure `vercel.json` is committed |
| Old version still showing after deploy | stale service worker | the app shows an "Update Now" banner; or hard-reload once |

---

## 13. Acceptance checklist

- [ ] Client can register (name, email, phone), log in, log out
- [ ] Client picks a cleaning package, toggles materials, sees the price change instantly
- [ ] Client books → gets an `ELR-######` reference → sees it in *My Bookings*, status *Pending*
- [ ] Client cannot see another client's bookings
- [ ] Manager sees all bookings + unassigned, confirms, assigns a cleaner to a cleaning job / a driver to a driving job
- [ ] Assignment is recorded in booking history
- [ ] Cleaner / driver sees only their assigned jobs and moves one to *Completed*
- [ ] Client sees the status change
- [ ] Admin edits a price at `/admin/prices`; new bookings use it; **existing bookings keep their amount**
- [ ] Admin records a payment; balance is calculated
- [ ] `npm run build` passes
- [ ] App deploys to Vercel and installs as a PWA

---

## 14. Phase 2 (not in this version)

Live GPS tracking, Mobile Money / Paystack integration, WhatsApp & SMS
notifications, reviews, discount codes, payroll, PDF invoices, multi-branch.
The schema (add-ons table stub, `business_settings`, per-price validity
windows) leaves room for these.
