# Live Deployment — EL-ROI Services

This project is provisioned and deployed. It began life as "EL-ROI Help Desk
Tracker" and was rebuilt in place as **EL-ROI Weekend Cleaning And Driving
Services Tracker** — same GitHub repo, Vercel project and Supabase project.

## URLs

| What | URL |
| --- | --- |
| Live app (production) | https://el-roi-help-desk.vercel.app |
| GitHub repo | https://github.com/isaacnyamaa30-dev/El-Roi_Help_Desk |
| Vercel project | https://vercel.com/tbc-daily/el-roi-help-desk |
| Supabase project | https://supabase.com/dashboard/project/erpwrjeafkbluogdordf |

_(The repo / Vercel project keep the old `el-roi-help-desk` name — cosmetic
only. Rename them in the GitHub and Vercel dashboards if you like.)_

## Supabase

- **Project ref:** `erpwrjeafkbluogdordf` · **Region:** `eu-west-2` (London)
- **Migrations applied:** `0001` … `0009` (see the README table). Applied
  with the built-in migration runner: `npm run db:migrate`.
- **Seeded** with `npm run seed -- --reset`: 1 admin, 1 manager, 3 cleaners,
  3 drivers, 5 clients; the full Cleaning + Driving catalogue with the real
  cleaning prices; 22 bookings across every status; payments + history.
- Booking numbers come from a Postgres sequence that never rewinds, so after
  a re-seed they keep counting up (`ELR-000068`+) — as a real business would.
- **Auth config:**
  - Site URL: `https://el-roi-help-desk.vercel.app`
  - Redirect allow-list: the Vercel domain, its preview subdomains, and
    `http://localhost:5173`
  - "Confirm email" is **off** so demo sign-ups log in immediately. Turn it
    back on in Dashboard → Authentication → Providers → Email for a class
    exercise.

## Vercel

- **Project:** `tbc-daily/el-roi-help-desk` · framework preset **Vite**
- **Environment variables** (Production, Preview, Development):
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. The service role key is
  **not** in Vercel.
- **SPA routing:** `vercel.json` rewrites all paths to `/index.html`, so
  deep links like `/admin/prices` and `/bookings/:id` work on refresh.
- **Auto-deploy is ACTIVE** — every push to `main` triggers a production
  deploy; pull requests get preview deployments.

## Demo accounts

Password for every **demo** account: `ElRoi-Demo-2026!`

| Email | Role |
| --- | --- |
| `admin@elroi.test` | admin |
| `manager@elroi.test` | manager |
| `cleaner1@elroi.test` … `cleaner3@elroi.test` | cleaner |
| `driver1@elroi.test` … `driver3@elroi.test` | driver |
| `client1@elroi.test` … `client5@elroi.test` | client |

**Owner / Super Admin:** `isaacnyamaa30@gmail.com` — role `admin`, its own
password (set at provisioning, given to you separately). The seed keeps this
account an admin but never touches its password.

> Demo credentials are for classroom use only.

---

## Redeploying after code changes

```bash
npm run dev            # verify locally
git add -A
git commit -m "Describe your change"
git push               # Vercel auto-deploys in ~1–2 min
```

Installed PWA users see an **"Update Now"** banner on their next visit;
first load after a deploy may briefly show the previous cached version
before the service worker updates.

Pushing from this machine uses Git Credential Manager (a browser prompt the
first time).

---

## Connecting a custom domain

1. Vercel project → **Settings → Domains → Add** — e.g. `services.elroi.com`.
2. Add the DNS record Vercel shows at your registrar (`CNAME` →
   `cname.vercel-dns.com` for a subdomain).
3. Wait for verification; Vercel issues the HTTPS certificate automatically.
4. In Supabase → **Authentication → URL Configuration**, change **Site URL**
   to the custom domain and add it to **Redirect URLs**.

No production URL is hard-coded in the app.

---

## Local `.env`

`.env` (git-ignored) on the build machine holds:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — the app
- `SUPABASE_SERVICE_ROLE_KEY` — `npm run seed`
- `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_REGION` —
  `npm run db:migrate`

The personal Supabase / Vercel / GitHub tokens used during the original
setup were removed after provisioning.
