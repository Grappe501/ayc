import { describe, expect, it } from 'vitest'
import {
  deriveDisplayName,
  isPlausibleEmail,
  isPlausiblePhone,
  normalizeEmail,
  normalizeLocationName,
  normalizePhone,
} from './normalize.ts'

describe('normalize', () => {
  it('normalizes email to lowercase trimmed', () => {
    expect(normalizeEmail('  Alex@Example.COM ')).toBe('alex@example.com')
  })

  it('normalizes US phone to digits with country code', () => {
    expect(normalizePhone('(501) 555-1234')).toBe('15015551234')
    expect(normalizePhone('15015551234')).toBe('15015551234')
  })

  it('normalizes location names for matching', () => {
    expect(normalizeLocationName('  University of Central Arkansas ')).toBe(
      'university of central arkansas',
    )
    expect(normalizeLocationName('Little Rock Central High School')).toContain('high school')
  })

  it('derives display name from preferred or first name', () => {
    expect(deriveDisplayName({ firstName: 'Alex', lastName: 'Rivera' })).toBe('Alex Rivera')
    expect(
      deriveDisplayName({ firstName: 'Alexandra', lastName: 'Rivera', preferredName: 'Alex' }),
    ).toBe('Alex Rivera')
  })

  it('validates plausible email and phone shapes', () => {
    expect(isPlausibleEmail('a@b.co')).toBe(true)
    expect(isPlausibleEmail('not-an-email')).toBe(false)
    expect(isPlausiblePhone('(501) 555-1234')).toBe(true)
    expect(isPlausiblePhone('555')).toBe(false)
  })
})
