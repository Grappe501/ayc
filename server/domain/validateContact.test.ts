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

  it('requires name and at least one contact method', () => {
    const result = validateContactCreate({
      ...valid,
      firstName: '',
      email: null,
      phone: null,
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((i) => i.field === 'firstName')).toBe(true)
    expect(result.issues.some((i) => i.field === 'contact')).toBe(true)
  })

  it('rejects invalid location codes', () => {
    const result = validateContactCreate({
      ...valid,
      location: { ...valid.location, code: 'UC' },
    })
    expect(result.ok).toBe(false)
  })
})
