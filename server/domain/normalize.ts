/**
 * Normalization helpers for matching and duplicate detection (Volume IV §8, §10).
 */

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Digits-only phone normalization. Assumes US numbers when 10 digits are present.
 * Example: "(501) 555-1234" → "15015551234"
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  if (digits.length === 10) return `1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return digits
  return digits
}

export function normalizePersonName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function normalizeLocationName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\bhigh\s+school\b/g, 'high school')
    .replace(/\s+/g, ' ')
    .trim()
}

export function deriveDisplayName(input: {
  firstName: string
  lastName: string
  preferredName?: string | null
}): string {
  const given = (input.preferredName?.trim() || input.firstName.trim()).trim()
  return `${given} ${input.lastName.trim()}`.replace(/\s+/g, ' ').trim()
}

export function isPlausibleEmail(value: string): boolean {
  const normalized = normalizeEmail(value)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

export function isPlausiblePhone(value: string): boolean {
  const normalized = normalizePhone(value)
  return normalized.length === 11 && normalized.startsWith('1')
}
