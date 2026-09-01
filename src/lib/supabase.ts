import { createClient } from '@supabase/supabase-js'

/**
 * Centralized Supabase browser client.
 *
 * The browser must ONLY use the public anon/publishable key. The service
 * role key must never appear in frontend code — it is used only by the
 * local seed script (see scripts/seed.ts).
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

/** True when both required environment variables are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Surfaced in dev so students immediately see a misconfigured .env.
  console.error(
    '[EL-ROI] Supabase is not configured. Copy .env.example to .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'public-anon-key-missing',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
