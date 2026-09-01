import { supabase } from '../lib/supabase'

export interface SignUpParams {
  fullName: string
  email: string
  password: string
}

export async function signUp({ fullName, email, password }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user() trigger to populate profiles.full_name.
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
