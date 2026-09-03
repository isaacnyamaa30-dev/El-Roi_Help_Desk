/* eslint-disable no-console */
/**
 * Migration runner for EL-ROI Services.
 *
 * Applies every `supabase/migrations/*.sql` file that has not yet been
 * recorded in `supabase_migrations.schema_migrations`, in filename order,
 * each in its own transaction.
 *
 * Connects through the Supabase session-mode pooler using the database
 * password in `.env` (SUPABASE_DB_PASSWORD) — no Supabase CLI login needed.
 *
 *   npm run db:migrate           # apply pending migrations
 *   npm run db:migrate -- --list # show status only
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import pg from 'pg'

loadEnv()

const REF = process.env.SUPABASE_PROJECT_REF
const PW = process.env.SUPABASE_DB_PASSWORD
const REGION = process.env.SUPABASE_DB_REGION ?? 'eu-west-2'

if (!REF || !PW) {
  console.error('Missing SUPABASE_PROJECT_REF or SUPABASE_DB_PASSWORD in .env')
  process.exit(1)
}

const listOnly = process.argv.includes('--list')

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'supabase',
  'migrations',
)

const connectionString = `postgresql://postgres.${REF}:${encodeURIComponent(
  PW,
)}@aws-0-${REGION}.pooler.supabase.com:5432/postgres`

function versionOf(file: string): string {
  return file.split('_')[0]
}

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  await client.query('create schema if not exists supabase_migrations')
  await client.query(`
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      statements text[] null,
      name text null,
      inserted_at timestamptz not null default now()
    )
  `)

  const applied = new Set(
    (
      await client.query(
        'select version from supabase_migrations.schema_migrations',
      )
    ).rows.map((r) => r.version as string),
  )

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  console.log('\nMigration status:')
  for (const f of files) {
    console.log(`  ${applied.has(versionOf(f)) ? '✓ applied ' : '• pending '} ${f}`)
  }

  if (listOnly) {
    await client.end()
    return
  }

  const pending = files.filter((f) => !applied.has(versionOf(f)))
  if (pending.length === 0) {
    console.log('\nNothing to apply.\n')
    await client.end()
    return
  }

  for (const f of pending) {
    const sql = readFileSync(join(migrationsDir, f), 'utf8')
    process.stdout.write(`\nApplying ${f} ... `)
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query(
        `insert into supabase_migrations.schema_migrations (version, name)
         values ($1, $2) on conflict (version) do nothing`,
        [versionOf(f), f],
      )
      await client.query('commit')
      console.log('done')
    } catch (err) {
      await client.query('rollback')
      console.error('FAILED\n')
      console.error(err instanceof Error ? err.message : err)
      await client.end()
      process.exit(1)
    }
  }

  console.log('\nAll migrations applied.\n')
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
