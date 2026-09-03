import { supabase } from '../lib/supabase'
import { WORKER_ROLES, type Role } from '../constants'
import type { Profile } from '../types'

export async function getProfile(id: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

/** Active workers of a given role — populates the assignment dropdown. */
export async function listWorkers(role: Role): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** All cleaners + drivers — the admin staff page. */
export async function listStaff(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', WORKER_ROLES)
    .order('full_name')
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** All client profiles — the admin clients page. */
export async function listClients(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** Admin only — change a user's role (RLS + guard trigger enforce this). */
export async function setUserRole(id: string, role: Role): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}

/** Admin only — activate / deactivate a staff account. */
export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}
