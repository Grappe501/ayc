import type { PreferredContactMethod } from './enums.ts'
import { PREFERRED_CONTACT_METHODS } from './enums.ts'

export type ContactReachFlags = {
  preferredContactMethod: PreferredContactMethod
  /** Has a phone and prefers text (or either). */
  textReady: boolean
  /** Has email/phone but preferred method still unknown. */
  needsPreferred: boolean
}

export function normalizePreferred(
  value: string | null | undefined,
): PreferredContactMethod {
  if (value && (PREFERRED_CONTACT_METHODS as readonly string[]).includes(value)) {
    return value as PreferredContactMethod
  }
  return 'UNKNOWN'
}

/** Pure flags used by Leader Board filters and attention. */
export function computeContactReachFlags(input: {
  hasEmail: boolean
  hasPhone: boolean
  preferredContactMethod?: string | null
  phoneConsent?: string | null
}): ContactReachFlags {
  const preferredContactMethod = normalizePreferred(input.preferredContactMethod)
  const phoneBlocked = input.phoneConsent === 'DENIED'
  const textReady =
    input.hasPhone &&
    !phoneBlocked &&
    (preferredContactMethod === 'TEXT' || preferredContactMethod === 'EITHER')
  const needsPreferred =
    (input.hasEmail || input.hasPhone) && preferredContactMethod === 'UNKNOWN'

  return { preferredContactMethod, textReady, needsPreferred }
}

/** When marking text-ready, choose a preferred method that includes text. */
export function preferredForTextReady(hasEmail: boolean): PreferredContactMethod {
  return hasEmail ? 'EITHER' : 'TEXT'
}
