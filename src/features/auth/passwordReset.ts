/** Canonical recovery landing path (must be allowlisted in Supabase Auth redirect URLs). */
export const PASSWORD_RESET_PATH = '/reset-password'

export function passwordResetRedirectTo(origin: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}${PASSWORD_RESET_PATH}`
}

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < 8) return 'Use a password with at least 8 characters.'
  if (password !== confirm) return 'Passwords do not match.'
  return null
}
