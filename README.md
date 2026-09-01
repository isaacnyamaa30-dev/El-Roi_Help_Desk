# EL-ROI Help Desk Tracker

**Every Issue Seen. Every Request Tracked.**

A small but realistic help desk / ticket management system built as a
teaching project. It demonstrates the full lifecycle of a modern web app:

> Frontend → Authentication → Backend/API → Database → Role-Based
> Authorization → Ticket Assignment → Agent Response → Database Seeding →
> Debugging → GitHub → Vercel Deployment → Updates → Redeployment → Custom
> Domain

---

## 1. Project Overview

Users report support issues as **tickets**. A **Manager** or **Administrator**
assigns each ticket to a support **Agent**. The agent and user exchange
messages until the issue is **resolved** or **closed**. Every important
action is written to a **history / audit trail**, so students can trace a
request all the way from a React form to a Postgres row and back.

### Roles

| Role | Can do |
| --- | --- |
| **User** | Register, create tickets, view & reply to *their own* tickets, reopen resolved tickets |
| **Agent** | See tickets *assigned to them*, reply, change status |
| **Manager** | See *all* tickets, assign/reassign agents, change priority & status, view reports |
| **Administrator** | Everything a Manager can do **plus** change user roles |

Public sign-ups always get the `user` role. Privileged roles are granted
only by an administrator (or the seed script).

---

## 2. Technology Stack

- **React 19 + Vite + TypeScript**
- **React Router** for routing
- **Tailwind CSS** for styling
- **Supabase** — PostgreSQL, Auth, Row Level Security, Data API
- **GitHub** for version control
- **Vercel** for deployment

---

## 3. Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) account
- A [GitHub](https://github.com/) account (for deployment)
- A [Vercel](https://vercel.com/) account (for deployment)

---

## 4. Local Setup

```bash
git clone <your-repo-url>
cd el-roi-help-desk
npm install
cp .env.example .env      # then edit .env with your Supabase values
npm run dev
```

The app runs at http://localhost:5173.

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser + seed | Project URL from Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | browser + seed | The **anon / publishable** key. Safe in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | **seed script only** | The **service_role** secret. Never commit it, never ship it to the browser. |

`.env` is git-ignored. Only `.env.example` is committed.

---

## 5. Supabase Setup

1. Create a new project at https://supabase.com/dashboard.
2. Open **SQL Editor** and run the migration files **in order**:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`

   (Or use the Supabase CLI: `supabase db push`.)
3. Copy **Settings → API → Project URL** and **anon key** into `.env`.
4. **Auth → Providers**: keep **Email** enabled.
5. **Auth → URL Configuration**: set the **Site URL** to
   `http://localhost:5173` for local development. Add your Vercel URL and
   custom domain later (see §9).
6. For a smoother classroom demo you can turn **"Confirm email"** off under
   **Auth → Providers → Email** so new registrations log in immediately.

### What the migrations create

- Tables: `profiles`, `tickets`, `ticket_messages`, `ticket_history`
- A trigger that creates a `profiles` row automatically on sign-up
- A sequence-backed function that generates ticket numbers `ERH-000001`, …
- Triggers that keep `updated_at` current and set
  `assigned_at` / `resolved_at` / `closed_at`
- Triggers that write `ticket_history` automatically on create / assign /
  status change / priority change / new message
- Guard triggers that stop non-admins changing roles and stop users/agents
  editing fields they should not
- Row Level Security policies for every table

---

## 6. Database Seeding

Creating Auth users needs the Admin API, so seeding is a **local Node
script** (`scripts/seed.ts`) run with the service role key.

```bash
# .env must contain VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run seed                 # seeds only if the tickets table is empty
npm run seed -- --reset      # wipes tickets/messages/history, then reseeds
```

It creates 1 admin, 1 manager, 3 agents, 3 users, 12 tickets covering every
status and priority, realistic conversations, and history entries.

`supabase/seed.sql` is kept as the conventional Supabase seed location but is
intentionally empty — see the comment inside it for why.

### Demo accounts

> **Demo credentials are for local / classroom use only. Never use them in
> production.**

Password for **every** demo account: `ElRoi#Demo2024`

| Email | Role | Name |
| --- | --- | --- |
| `admin@elroi.test` | admin | System Administrator |
| `manager@elroi.test` | manager | Help Desk Manager |
| `agent1@elroi.test` | agent | Kwame Mensah |
| `agent2@elroi.test` | agent | Ama Boateng |
| `agent3@elroi.test` | agent | Kojo Asare |
| `user1@elroi.test` | user | Daniel Owusu |
| `user2@elroi.test` | user | Akosua Frimpong |
| `user3@elroi.test` | user | Samuel Osei |

---

## 7. Project Structure

```text
el-roi-help-desk/
├── src/
│   ├── components/      layout, tickets, dashboard, common (reusable UI)
│   ├── pages/           auth, user, agent, admin  + shared TicketDetail
│   ├── hooks/           useAuth, useTickets
│   ├── lib/             supabase.ts (single client)
│   ├── services/        auth.ts, tickets.ts, profiles.ts (all API calls)
│   ├── constants/       roles, statuses, priorities, categories, transitions
│   ├── types/           shared TypeScript row types
│   └── utils/           format, validation, metrics
├── supabase/
│   ├── migrations/      0001_init_schema.sql, 0002_rls_policies.sql
│   └── seed.sql
├── scripts/seed.ts      database seed (service role, local only)
├── .env.example
└── vercel.json          SPA rewrite for client-side routing
```

---

## 8. Deployment (GitHub + Vercel)

1. Push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial EL-ROI Help Desk Tracker"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. In Vercel, **Add New → Project** and import the GitHub repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist`.
4. Add environment variables **VITE_SUPABASE_URL** and
   **VITE_SUPABASE_ANON_KEY** (do **not** add the service role key).
5. Deploy. `vercel.json` rewrites every path to `index.html` so deep links
   like `/admin/tickets` and `/tickets/123` work on refresh.
6. In Supabase **Auth → URL Configuration**, add your
   `https://<project>.vercel.app` URL to **Site URL** / **Redirect URLs**.

---

## 9. Custom Domain

To serve the app from e.g. `helpdesk.elroi.com`:

1. Open the Vercel project → **Settings → Domains**.
2. **Add** the domain.
3. At your DNS provider, add the record Vercel shows you:
   - apex domain → `A` record to Vercel's IP, or
   - subdomain → `CNAME` to `cname.vercel-dns.com`.
4. Wait for Vercel to verify DNS.
5. Vercel provisions an HTTPS/SSL certificate automatically.
6. In Supabase **Auth → URL Configuration**, update **Site URL** and add the
   custom domain to **Redirect URLs**. Update any email templates that
   reference the old URL.

No production URL is hard-coded anywhere in the app — it always uses
`window.location.origin` and the environment variables.

---

## 10. Updating a Deployed App

Example: change the user dashboard heading.

1. Edit `src/pages/user/Dashboard.tsx` (`title="My Dashboard"` → your text).
2. `npm run dev` and verify locally.
3. `git commit -am "Update dashboard heading"` and `git push`.
4. Vercel redeploys automatically on push to `main`.
5. Refresh the live site to confirm.

---

## 11. Debugging Guide

The app is deliberately structured so you can trace an action through every
layer. For **Create Ticket**:

| Layer | Where to look |
| --- | --- |
| React form | `src/components/tickets/TicketForm.tsx` — validation runs here |
| Service call | `src/services/tickets.ts` → `createTicket()` |
| Network | DevTools → Network → the `POST .../rest/v1/tickets` request |
| Authorization | Supabase → Auth logs + the `tickets_insert` RLS policy |
| Database | Supabase → Table editor → `tickets` (+ `ticket_history` row from the trigger) |
| UI update | `useTicketList` re-fetch on the dashboard |

### Common errors and how to diagnose them

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Supabase is not configured" banner | missing/typo'd `.env` values | check `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, restart `npm run dev` |
| Login works locally, fails on Vercel | env vars not set in Vercel | add them in Vercel → Settings → Environment Variables, redeploy |
| User creates a ticket but can't see it | RLS `tickets_select` policy wrong or missing | re-run `0002_rls_policies.sql`; confirm `created_by = auth.uid()` |
| Agent doesn't see a newly assigned ticket | assignment didn't set `assigned_to`, or query filters wrong | check the `tickets` row; agent list relies on RLS, not a client filter |
| Frontend expects a column that 404s / errors | migration not applied | re-run `0001_init_schema.sql` |
| Refreshing `/admin/tickets` gives 404 on Vercel | SPA rewrite missing | ensure `vercel.json` is committed |
| Form won't submit | client validation failing | see the red field messages; rules are in `src/utils/validation.ts` |

---

## 12. Acceptance Checklist

- [ ] Register / login / logout
- [ ] Protected pages redirect anonymous users to `/login`
- [ ] User creates a ticket → gets `ERH-######` → sees it in *My Tickets*
- [ ] User cannot see another user's tickets
- [ ] Manager sees all tickets + unassigned list
- [ ] Manager assigns an agent → `ticket_history` records it
- [ ] Agent sees only their assigned tickets
- [ ] Agent replies → user sees the reply
- [ ] Agent moves ticket Open → Assigned → In Progress → Resolved → Closed
- [ ] Resolved ticket can be reopened
- [ ] `npm run seed` populates a fresh database
- [ ] `npm run build` succeeds
- [ ] App deploys to Vercel and deep-link refresh works

---

## 13. Phase 2 Ideas (not in the MVP)

File attachments, email/push notifications, SLA tracking, knowledge base,
departments, escalation, satisfaction ratings, dark mode, CSV/PDF export,
social login, multi-organization support.
