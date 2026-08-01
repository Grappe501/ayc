import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  return { url, serviceRoleKey }
}

export function isSupabaseConfigured() {
  const { url, serviceRoleKey } = getSupabaseConfig()
  return Boolean(url && serviceRoleKey)
}

export function getSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseConfig()
  if (!url || !serviceRoleKey) {
    throw Object.assign(new Error('MISCONFIGURED'), {
      code: 'MISCONFIGURED' as const,
      message: 'Supabase Auth is not configured on this environment.',
    })
  }
  if (!cached) {
    cached = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return cached
}

export const PROFILE_PHOTOS_BUCKET = 'profile-photos'
