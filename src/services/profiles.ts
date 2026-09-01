import { supabase } from '../lib/supabase'
import { ROLES } from '../constants'
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
  patch: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>,
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

/** All agent profiles — used to populate the assignment dropdown. */
export async function listAgents(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', ROLES.AGENT)
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** Every profile — admin user-management screen. */
export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** Admin only — change a user's role (RLS + guard trigger enforce this). */
export async function setUserRole(
  id: string,
  role: Profile['role'],
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
  if (error) throw error
}
