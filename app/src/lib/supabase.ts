import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your .env file and ensure ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper to get current session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Helper to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession()
  return !!session
}
