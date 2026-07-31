import { normalizeEmail, normalizePhone } from './normalize.ts'

/** Mask email for directory viewers without write access. */
export function maskEmail(value: string): string {
  const email = normalizeEmail(value)
  const at = email.indexOf('@')
  if (at <= 0) return '••••@••••'
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const shown = local.slice(0, 1) || '•'
  return `${shown}${'•'.repeat(Math.min(4, Math.max(local.length - 1, 1)))}@${domain}`
}

/** Mask phone for directory viewers without write access. */
export function maskPhone(value: string): string {
  const digits = normalizePhone(value)
  if (digits.length < 4) return '•••-•••-••••'
  return `•••-•••-${digits.slice(-4)}`
}

export function presentContactMethods(
  email: string | null | undefined,
  phone: string | null | undefined,
  reveal: boolean,
): { email: string | null; phone: string | null; revealed: boolean } {
  return {
    email: email ? (reveal ? email : maskEmail(email)) : null,
    phone: phone ? (reveal ? phone : maskPhone(phone)) : null,
    revealed: reveal,
  }
}
