import { getSupabaseBrowserClient, isBrowserAuthConfigured } from './supabaseClient'

export async function getAccessToken(): Promise<string | null> {
  const client = getSupabaseBrowserClient()
  if (!client) return null
  const { data } = await client.auth.getSession()
  return data.session?.access_token ?? null
}

export async function signInWithPassword(email: string, password: string) {
  const client = getSupabaseBrowserClient()
  if (!client) {
    return {
      ok: false as const,
      error: { message: 'Login is not configured on this environment.' },
    }
  }
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    return {
      ok: false as const,
      error: { message: error?.message || 'Could not log in.' },
    }
  }
  return { ok: true as const, session: data.session }
}

export async function signOut() {
  const client = getSupabaseBrowserClient()
  if (!client) return
  await client.auth.signOut()
}

export async function setSessionFromTokens(accessToken: string, refreshToken: string) {
  const client = getSupabaseBrowserClient()
  if (!client) return { ok: false as const }
  const { error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return { ok: !error }
}

export { isBrowserAuthConfigured }
