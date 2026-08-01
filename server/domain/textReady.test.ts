import { describe, expect, it } from 'vitest'
import {
  computeContactReachFlags,
  preferredForTextReady,
} from './textReady.ts'

describe('computeContactReachFlags', () => {
  it('marks text-ready when phone + TEXT preferred', () => {
    const flags = computeContactReachFlags({
      hasEmail: false,
      hasPhone: true,
      preferredContactMethod: 'TEXT',
    })
    expect(flags.textReady).toBe(true)
    expect(flags.needsPreferred).toBe(false)
  })

  it('needs preferred when contact exists but UNKNOWN', () => {
    const flags = computeContactReachFlags({
      hasEmail: true,
      hasPhone: true,
      preferredContactMethod: 'UNKNOWN',
    })
    expect(flags.needsPreferred).toBe(true)
    expect(flags.textReady).toBe(false)
  })

  it('blocks text-ready when phone consent DENIED', () => {
    const flags = computeContactReachFlags({
      hasEmail: false,
      hasPhone: true,
      preferredContactMethod: 'TEXT',
      phoneConsent: 'DENIED',
    })
    expect(flags.textReady).toBe(false)
  })
})

describe('preferredForTextReady', () => {
  it('uses EITHER when email also present', () => {
    expect(preferredForTextReady(true)).toBe('EITHER')
    expect(preferredForTextReady(false)).toBe('TEXT')
  })
})
