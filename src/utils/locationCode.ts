/**
 * Suggest a three-letter location code from a display name.
 * Leader may override; uniqueness is enforced server-side later.
 */
export function suggestLocationCode(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

  if (!cleaned) return ''

  const stop = new Set([
    'THE',
    'OF',
    'AND',
    'AT',
    'HIGH',
    'SCHOOL',
    'UNIVERSITY',
    'COLLEGE',
    'COMMUNITY',
    'COUNTY',
  ])

  const words = cleaned.split(' ').filter(Boolean)
  const meaningful = words.filter((w) => !stop.has(w))

  if (meaningful.length >= 3) {
    return (meaningful[0][0] + meaningful[1][0] + meaningful[2][0]).slice(0, 3)
  }

  if (meaningful.length === 2) {
    const a = meaningful[0]
    const b = meaningful[1]
    if (a.length >= 2) return (a.slice(0, 2) + b[0]).slice(0, 3)
    return (a[0] + b.slice(0, 2)).slice(0, 3)
  }

  const primary = meaningful[0] ?? words[0]
  return primary.replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X')
}

export function toCompositeCode(
  locationType: 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY',
  code: string,
): string {
  const prefix =
    locationType === 'COLLEGE' ? 'COL' : locationType === 'HIGH_SCHOOL' ? 'HSC' : 'CTY'
  return `${prefix}-${code.toUpperCase()}`
}

export function isValidLocationCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code)
}
