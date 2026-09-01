/* eslint-disable no-console */
/**
 * EL-ROI Help Desk Tracker — database seed script.
 *
 * Run locally only. Requires the Supabase SERVICE ROLE key, which must
 * NEVER be exposed to the browser or committed to git.
 *
 *   npm run seed          # seed only if the tickets table is empty
 *   npm run seed -- --reset   # wipe tickets/messages/history first, then seed
 *
 * What it creates:
 *   - 1 admin, 1 manager, 3 agents, 3 users (Supabase Auth + profiles)
 *   - 12 tickets covering every status and priority
 *   - realistic conversations on several tickets
 *   - ticket history entries for assignment + status changes
 */

import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\nMissing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
      'in your .env file (see .env.example).\n',
  )
  process.exit(1)
}

const reset = process.argv.includes('--reset')

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* ----------------------------------------------------------------- demo users
 * Development-only passwords. Documented in the README demo section.
 * DO NOT use these anywhere near production.
 */
const DEMO_PASSWORD = 'ElRoi#Demo2024'

const DEMO_USERS = [
  { email: 'admin@elroi.test',   full_name: 'System Administrator', role: 'admin' },
  { email: 'manager@elroi.test', full_name: 'Help Desk Manager',    role: 'manager' },
  { email: 'agent1@elroi.test',  full_name: 'Kwame Mensah',         role: 'agent' },
  { email: 'agent2@elroi.test',  full_name: 'Ama Boateng',          role: 'agent' },
  { email: 'agent3@elroi.test',  full_name: 'Kojo Asare',           role: 'agent' },
  { email: 'user1@elroi.test',   full_name: 'Daniel Owusu',         role: 'user' },
  { email: 'user2@elroi.test',   full_name: 'Akosua Frimpong',      role: 'user' },
  { email: 'user3@elroi.test',   full_name: 'Samuel Osei',          role: 'user' },
] as const

type DemoEmail = (typeof DEMO_USERS)[number]['email']

const ids: Record<string, string> = {}

async function ensureUser(u: (typeof DEMO_USERS)[number]) {
  // Try to create; if the address is taken, look the user up instead.
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  })

  let userId = data?.user?.id

  if (error) {
    if (!/already/i.test(error.message)) throw error
    // paginate through existing users to find this email
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data: list, error: listErr } =
        await admin.auth.admin.listUsers({ page, perPage: 200 })
      if (listErr) throw listErr
      userId = list.users.find((x) => x.email === u.email)?.id
      if (list.users.length < 200) break
    }
  }

  if (!userId) throw new Error(`Could not resolve user id for ${u.email}`)
  ids[u.email] = userId

  // The signup trigger creates the profile as role 'user'; upsert the
  // real role + name here (service role bypasses the role-change guard).
  const { error: upErr } = await admin.from('profiles').upsert({
    id: userId,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
    is_active: true,
  })
  if (upErr) throw upErr

  console.log(`  ✓ ${u.role.padEnd(8)} ${u.email}`)
}

/* --------------------------------------------------------------------- tickets */

interface SeedTicket {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status:
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'waiting_for_user'
    | 'resolved'
    | 'closed'
    | 'reopened'
  createdBy: DemoEmail
  assignedTo?: DemoEmail
  daysAgo: number
  conversation?: { from: DemoEmail; message: string }[]
}

const SEED_TICKETS: SeedTicket[] = [
  {
    title: 'Computer cannot start',
    description:
      'My desktop computer will not power on this morning. No lights, no fan noise. I have checked the power cable and the wall socket works.',
    category: 'Hardware',
    priority: 'high',
    status: 'in_progress',
    createdBy: 'user1@elroi.test',
    assignedTo: 'agent1@elroi.test',
    daysAgo: 4,
    conversation: [
      { from: 'user1@elroi.test', message: 'My computer will not turn on at all this morning.' },
      { from: 'agent1@elroi.test', message: 'Thanks for reporting. Can you try a different power cable and confirm the socket has power with another device?' },
      { from: 'user1@elroi.test', message: 'I tried another cable and the socket works with my phone charger. Still nothing.' },
      { from: 'agent1@elroi.test', message: 'Understood. I am logging this as a likely power supply failure and will bring a replacement unit to your desk today.' },
    ],
  },
  {
    title: 'Forgotten account password',
    description:
      'I cannot log in to my staff account. I tried the self-service reset but never received the reset email.',
    category: 'Account / Login',
    priority: 'medium',
    status: 'resolved',
    createdBy: 'user2@elroi.test',
    assignedTo: 'agent2@elroi.test',
    daysAgo: 6,
    conversation: [
      { from: 'user2@elroi.test', message: 'I cannot login to my account.' },
      { from: 'agent2@elroi.test', message: 'Have you tried using the password reset option?' },
      { from: 'user2@elroi.test', message: 'Yes, but I did not receive the reset email.' },
      { from: 'agent2@elroi.test', message: 'I have reset the account manually. Please try logging in again.' },
      { from: 'user2@elroi.test', message: 'It is working now. Thank you.' },
    ],
  },
  {
    title: 'Printer is not printing',
    description:
      'The shared printer on the second floor accepts jobs but nothing comes out. The queue shows the job as "printing" then it disappears.',
    category: 'Printer',
    priority: 'medium',
    status: 'assigned',
    createdBy: 'user3@elroi.test',
    assignedTo: 'agent1@elroi.test',
    daysAgo: 2,
  },
  {
    title: 'Unable to connect to Wi-Fi',
    description:
      'My laptop cannot connect to the school Wi-Fi network. It asks for a password repeatedly even though the password is correct.',
    category: 'Internet / Network',
    priority: 'urgent',
    status: 'open',
    createdBy: 'user1@elroi.test',
    daysAgo: 1,
  },
  {
    title: 'Request to install application software',
    description:
      'I need the data analysis application installed on my workstation for an upcoming project. Please advise on the approval process.',
    category: 'Software',
    priority: 'low',
    status: 'waiting_for_user',
    createdBy: 'user2@elroi.test',
    assignedTo: 'agent3@elroi.test',
    daysAgo: 5,
    conversation: [
      { from: 'user2@elroi.test', message: 'Please install the data analysis application on my machine.' },
      { from: 'agent3@elroi.test', message: 'This software requires manager approval. Could you reply with your manager’s name and the project reference so I can request sign-off?' },
    ],
  },
  {
    title: 'Email attachments will not open',
    description:
      'When I try to open PDF attachments from email I get an error saying the file is damaged. Colleagues can open the same files.',
    category: 'Email',
    priority: 'medium',
    status: 'in_progress',
    createdBy: 'user3@elroi.test',
    assignedTo: 'agent2@elroi.test',
    daysAgo: 3,
    conversation: [
      { from: 'user3@elroi.test', message: 'PDF attachments from email say the file is damaged when I open them.' },
      { from: 'agent2@elroi.test', message: 'It sounds like the PDF reader association is broken. I will connect remotely this afternoon to reinstall the reader.' },
    ],
  },
  {
    title: 'Need access to shared project folder',
    description:
      'I have joined the Roads project team but cannot open the shared project folder on the network drive. Access is denied.',
    category: 'Access / Permission',
    priority: 'high',
    status: 'resolved',
    createdBy: 'user1@elroi.test',
    assignedTo: 'agent3@elroi.test',
    daysAgo: 8,
    conversation: [
      { from: 'user1@elroi.test', message: 'Access denied when opening the Roads project shared folder.' },
      { from: 'agent3@elroi.test', message: 'I have added your account to the Roads project security group. Please log out and back in, then try again.' },
      { from: 'user1@elroi.test', message: 'I can open it now. Thanks for the quick help.' },
    ],
  },
  {
    title: 'Laptop battery drains very quickly',
    description:
      'My work laptop battery lasts less than 30 minutes on a full charge. It is about two years old.',
    category: 'Hardware',
    priority: 'low',
    status: 'closed',
    createdBy: 'user2@elroi.test',
    assignedTo: 'agent1@elroi.test',
    daysAgo: 14,
    conversation: [
      { from: 'user2@elroi.test', message: 'Laptop battery only lasts about 30 minutes now.' },
      { from: 'agent1@elroi.test', message: 'The battery health report shows it is at 41% of design capacity. I have ordered a replacement battery.' },
      { from: 'agent1@elroi.test', message: 'Replacement battery fitted and tested. Holding charge normally now. Closing this ticket.' },
    ],
  },
  {
    title: 'Monitor flickering intermittently',
    description:
      'My second monitor flickers on and off every few minutes. Swapping the cable did not help.',
    category: 'Hardware',
    priority: 'medium',
    status: 'reopened',
    createdBy: 'user3@elroi.test',
    assignedTo: 'agent1@elroi.test',
    daysAgo: 10,
    conversation: [
      { from: 'user3@elroi.test', message: 'Second monitor keeps flickering.' },
      { from: 'agent1@elroi.test', message: 'Replaced the display cable and updated the graphics driver. Please monitor for a day.' },
      { from: 'user3@elroi.test', message: 'It was fine for a day but the flickering has come back. Reopening this.' },
    ],
  },
  {
    title: 'VPN disconnects every few minutes',
    description:
      'When working from home the VPN drops the connection roughly every five minutes and I have to reconnect manually.',
    category: 'Internet / Network',
    priority: 'high',
    status: 'in_progress',
    createdBy: 'user1@elroi.test',
    assignedTo: 'agent2@elroi.test',
    daysAgo: 2,
    conversation: [
      { from: 'user1@elroi.test', message: 'VPN keeps dropping about every five minutes from home.' },
      { from: 'agent2@elroi.test', message: 'Please send a screenshot of the VPN client log next time it drops so we can see the disconnect reason.' },
    ],
  },
  {
    title: 'New starter needs an email account',
    description:
      'We have a new team member starting Monday who needs an email account and standard software set up.',
    category: 'Account / Login',
    priority: 'medium',
    status: 'assigned',
    createdBy: 'user2@elroi.test',
    assignedTo: 'agent3@elroi.test',
    daysAgo: 1,
  },
  {
    title: 'Keyboard keys not responding',
    description:
      'Several keys on my keyboard (E, R and the spacebar) only work if pressed very hard. It is slowing me down a lot.',
    category: 'Hardware',
    priority: 'medium',
    status: 'open',
    createdBy: 'user3@elroi.test',
    daysAgo: 0,
  },
]

async function wipe() {
  console.log('  Wiping existing tickets (cascades to messages + history)...')
  const { error } = await admin
    .from('tickets')
    .delete()
    .not('id', 'is', null)
  if (error) throw error
}

async function seedTickets() {
  for (const t of SEED_TICKETS) {
    const createdAt = daysAgoIso(t.daysAgo)
    const assignedTo = t.assignedTo ? ids[t.assignedTo] : null
    const assignedAt = assignedTo ? daysAgoIso(Math.max(t.daysAgo - 1, 0)) : null
    const resolvedAt =
      t.status === 'resolved' || t.status === 'closed'
        ? daysAgoIso(Math.max(t.daysAgo - 2, 0))
        : null
    const closedAt =
      t.status === 'closed' ? daysAgoIso(Math.max(t.daysAgo - 1, 0)) : null

    const { data: ticket, error } = await admin
      .from('tickets')
      .insert({
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        created_by: ids[t.createdBy],
        assigned_to: assignedTo,
        assigned_by: assignedTo ? ids['manager@elroi.test'] : null,
        created_at: createdAt,
        updated_at: createdAt,
        assigned_at: assignedAt,
        resolved_at: resolvedAt,
        closed_at: closedAt,
      })
      .select()
      .single()
    if (error) throw error

    // Supplemental history: assignment + status (the insert trigger already
    // logged 'ticket_created').
    const history: Record<string, unknown>[] = []
    if (assignedTo) {
      history.push({
        ticket_id: ticket.id,
        action: 'ticket_assigned',
        old_value: 'Unassigned',
        new_value: DEMO_USERS.find((u) => u.email === t.assignedTo)?.full_name,
        changed_by: ids['manager@elroi.test'],
        created_at: assignedAt,
      })
      history.push({
        ticket_id: ticket.id,
        action: 'status_changed',
        old_value: 'open',
        new_value: 'assigned',
        changed_by: ids['manager@elroi.test'],
        created_at: assignedAt,
      })
    }
    if (['in_progress', 'resolved', 'closed', 'reopened'].includes(t.status)) {
      history.push({
        ticket_id: ticket.id,
        action: 'status_changed',
        old_value: 'assigned',
        new_value: t.status === 'reopened' ? 'reopened' : t.status,
        changed_by: assignedTo,
        created_at: daysAgoIso(Math.max(t.daysAgo - 2, 0)),
      })
    }
    if (history.length) {
      const { error: hErr } = await admin.from('ticket_history').insert(history)
      if (hErr) throw hErr
    }

    // Conversation — the message trigger bumps updated_at and logs history.
    if (t.conversation?.length) {
      for (let i = 0; i < t.conversation.length; i++) {
        const msg = t.conversation[i]
        const { error: mErr } = await admin.from('ticket_messages').insert({
          ticket_id: ticket.id,
          sender_id: ids[msg.from],
          message: msg.message,
          message_type: 'public',
          created_at: daysAgoIso(Math.max(t.daysAgo - i * 0.25, 0)),
        })
        if (mErr) throw mErr
      }
    }

    console.log(`  ✓ ${ticket.ticket_number}  ${t.title}`)
  }
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

async function main() {
  console.log('\nEL-ROI Help Desk Tracker — seeding\n')

  console.log('Users:')
  for (const u of DEMO_USERS) await ensureUser(u)

  const { count } = await admin
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  if (reset) {
    await wipe()
  } else if ((count ?? 0) > 0) {
    console.log(
      `\nTickets table already has ${count} rows. Skipping ticket seed.\n` +
        'Run "npm run seed -- --reset" to wipe and reseed.\n',
    )
    return
  }

  console.log('\nTickets:')
  await seedTickets()

  console.log('\nDone. Demo password for every account: ' + DEMO_PASSWORD + '\n')
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err)
  process.exit(1)
})
