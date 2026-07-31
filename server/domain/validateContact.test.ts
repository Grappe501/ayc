import { describe, expect, it } from 'vitest'
import { validateContactCreate } from './validateContact.ts'

describe('validateContactCreate', () => {
  const valid = {
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex@example.com',
    phone: '(501) 555-1234',
    location: {
      locationType: 'COLLEGE' as const,
      name: 'University of Central Arkansas',
      code: 'uca',
    },
    affiliationType: 'CURRENT_COLLEGE' as const,
    primaryTeamId: 'team-org',
    position: 'VOLUNTEER' as const,
  }

  it('accepts a complete contact and normalizes values', () => {
    const result = validateContactCreate(valid)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.email?.normalized).toBe('alex@example.com')
    expect(result.value.phone?.normalized).toBe('15015551234')
    expect(result.value.location.compositeCode).toBe('COL-UCA')
    expect(result.value.person.displayName).toBe('Alex Rivera')
  })

  it('requires name and contact methods unless status is Prospective', () => {
    const missing = validateContactCreate({
      ...valid,
      firstName: '',
      email: null,
      phone: null,
    })
    expect(missing.ok).toBe(false)
    if (missing.ok) return
    expect(missing.issues.some((i) => i.field === 'firstName')).toBe(true)
    expect(missing.issues.some((i) => i.field === 'contact')).toBe(true)

    const prospective = validateContactCreate({
      ...valid,
      email: null,
      phone: null,
      status: 'PROSPECTIVE',
    })
    expect(prospective.ok).toBe(true)
  })

  it('rejects invalid location codes', () => {
    const result = validateContactCreate({
      ...valid,
      location: { ...valid.location, code: 'UC' },
    })
    expect(result.ok).toBe(false)
  })
})
