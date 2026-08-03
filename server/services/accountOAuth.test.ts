import { describe, expect, it } from 'vitest'
import { normalizeEmail } from '../domain/normalize.ts'

describe('OAuth invite gating helpers', () => {
  it('normalizes Google emails for invite matching', () => {
    expect(normalizeEmail('  Chance@Example.COM ')).toBe('chance@example.com')
  })
})
