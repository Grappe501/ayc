import { getSupabaseBrowserClient, isBrowserAuthConfigured } from './supabaseClient'
import { googleOAuthRedirectTo } from './oauth'
import { passwordResetRedirectTo } from './passwordReset'

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

export async function signInWithGoogle(nextPath?: string | null) {
  const client = getSupabaseBrowserClient()
  if (!client) {
    return {
      ok: false as const,
      error: { message: 'Login is not configured on this environment.' },
    }
  }
  const redirectTo = googleOAuthRedirectTo(window.location.origin, nextPath)
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) {
    return {
      ok: false as const,
      error: { message: error.message || 'Could not start Google sign-in.' },
    }
  }
  return { ok: true as const }
}

export async function requestPasswordReset(email: string) {
  const client = getSupabaseBrowserClient()
  if (!client) {
    return {
      ok: false as const,
      error: { message: 'Login is not configured on this environment.' },
    }
  }
  const redirectTo = passwordResetRedirectTo(window.location.origin)
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) {
    return {
      ok: false as const,
      error: { message: error.message || 'Could not send reset email.' },
    }
  }
  return { ok: true as const }
}

export async function updatePassword(password: string) {
  const client = getSupabaseBrowserClient()
  if (!client) {
    return {
      ok: false as const,
      error: { message: 'Login is not configured on this environment.' },
    }
  }
  const { error } = await client.auth.updateUser({ password })
  if (error) {
    return {
      ok: false as const,
      error: { message: error.message || 'Could not update password.' },
    }
  }
  return { ok: true as const }
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
