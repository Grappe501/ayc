/** OAuth callback path — must be allowlisted in Supabase Auth redirect URLs. */
export const OAUTH_CALLBACK_PATH = '/auth/callback'

export function googleOAuthRedirectTo(origin: string, nextPath?: string | null): string {
  const base = origin.replace(/\/$/, '')
  const url = new URL(`${base}${OAUTH_CALLBACK_PATH}`)
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    url.searchParams.set('next', nextPath)
  }
  return url.toString()
}

/** Browser flag — set VITE_AYC_GOOGLE_OAUTH=false to hide the button. */
export function isGoogleOAuthUiEnabled(): boolean {
  const flag = import.meta.env.VITE_AYC_GOOGLE_OAUTH?.trim().toLowerCase()
  if (flag === 'false' || flag === '0' || flag === 'off') return false
  return true
}
