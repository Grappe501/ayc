import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function isBrowserAuthConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  )
}

export function getSupabaseBrowserClient() {
  if (!isBrowserAuthConfigured()) return null
  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL.trim(),
      import.meta.env.VITE_SUPABASE_ANON_KEY.trim(),
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'ayc-auth',
        },
      },
    )
  }
  return client
}
