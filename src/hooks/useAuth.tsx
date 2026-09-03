import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getProfile } from '../services/profiles'
import { signOut as apiSignOut } from '../services/auth'
import { STAFF_ROLES, WORKER_ROLES, type Role } from '../constants'
import type { Profile } from '../types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  role: Role | null
  /** Manager or admin. */
  isStaff: boolean
  /** Cleaner or driver. */
  isWorker: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    try {
      setProfile(await getProfile(userId))
    } catch (err) {
      console.error('[EL-ROI] Failed to load profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, next) => {
        setSession(next)
        if (next?.user) await loadProfile(next.user.id)
        else setProfile(null)
      },
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(() => {
    const role = (profile?.role ?? null) as Role | null
    return {
      session,
      profile,
      loading,
      role,
      isStaff: role ? STAFF_ROLES.includes(role) : false,
      isWorker: role ? WORKER_ROLES.includes(role) : false,
      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user.id)
      },
      signOut: async () => {
        await apiSignOut()
        setProfile(null)
      },
    }
  }, [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
