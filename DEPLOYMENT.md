# Live Deployment — EL-ROI Help Desk Tracker

This project has been provisioned and deployed. Details below.

## URLs

| What | URL |
| --- | --- |
| Live app (production) | https://el-roi-help-desk.vercel.app |
| Vercel project | https://vercel.com/tbc-daily/el-roi-help-desk |
| Supabase project | https://supabase.com/dashboard/project/erpwrjeafkbluogdordf |

## Supabase

- **Project ref:** `erpwrjeafkbluogdordf`
- **Region:** `eu-west-2` (London)
- **Migrations applied:** `0001_init_schema.sql`, `0002_rls_policies.sql`
  (via `supabase db push`)
- **Seeded:** 8 accounts, 12 tickets, conversations and history
  (via `npm run seed`). Ticket numbers are issued from a Postgres sequence
  that never rewinds, so after re-seeding they continue upward (e.g.
  `ERH-000014`+) rather than restarting at `ERH-000001` — this is the same
  way a real help desk behaves.
- **Auth config:**
  - Site URL: `https://el-roi-help-desk.vercel.app`
  - Redirect allow-list includes the Vercel domain, its preview
    subdomains, and `http://localhost:5173`
  - "Confirm email" is **off** (`mailer_autoconfirm = true`) so demo
    sign-ups work immediately. Turn it back on in
    Dashboard → Authentication → Providers → Email if you want the
    confirmation step for a class exercise.

## Vercel

- **Project:** `tbc-daily/el-roi-help-desk`
- **Framework preset:** Vite (build `vite build`, output `dist`)
- **Environment variables** set for Production, Preview and Development:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - (the service role key is **not** in Vercel — it is only used by the
    local seed script)
- **SPA routing:** `vercel.json` rewrites all paths to `/index.html`, so
  deep links like `/admin/tickets` and `/tickets/:id` work on refresh.

## Demo accounts

Password for every account: `ElRoi#Demo2024`

| Email | Role |
| --- | --- |
| `admin@elroi.test` | admin |
| `manager@elroi.test` | manager |
| `agent1@elroi.test` … `agent3@elroi.test` | agent |
| `user1@elroi.test` … `user3@elroi.test` | user |

> Demo credentials are for classroom use only.

---

## Redeploying after code changes

The current deploys were pushed straight from this machine with the Vercel
CLI:

```bash
# from the project root, with VERCEL_TOKEN available
vercel deploy --prod
```

### Recommended: connect GitHub for automatic redeploys

For the "commit → push → auto-redeploy" workflow the spec describes, connect
the repo to GitHub (this step needs your GitHub login, so it was left for
you):

1. Create an empty repo on GitHub, e.g. `el-roi-help-desk` (no README).
2. Push this project:
   ```bash
   git remote add origin https://github.com/<you>/el-roi-help-desk.git
   git push -u origin main
   ```
3. In the Vercel project → **Settings → Git**, connect the GitHub repo.
4. From then on, every `git push` to `main` triggers a production deploy,
   and pull requests get preview deployments automatically.

After connecting GitHub you can stop using `vercel deploy` by hand.

---

## Connecting a custom domain

1. Vercel project → **Settings → Domains → Add** — enter e.g.
   `helpdesk.elroi.com`.
2. Add the DNS record Vercel shows at your domain registrar
   (`CNAME` → `cname.vercel-dns.com` for a subdomain).
3. Wait for verification; Vercel issues the HTTPS certificate automatically.
4. In Supabase → **Authentication → URL Configuration**, change **Site URL**
   to the custom domain and add it to **Redirect URLs**.

---

## Rotating the tokens used for setup

The `.env` file on this machine contains a Supabase access token and a
Vercel token that were used only for provisioning. They are git-ignored, but
you should delete them now that setup is done:

- Supabase: https://supabase.com/dashboard/account/tokens
- Vercel: https://vercel.com/account/tokens

The app itself does not need them — it only uses `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`.
