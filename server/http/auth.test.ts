import { describe, expect, it } from 'vitest'
import { secretsMatch } from './auth.ts'

describe('secretsMatch', () => {
  it('accepts identical secrets', () => {
    expect(secretsMatch('ayc-beta-secret', 'ayc-beta-secret')).toBe(true)
  })

  it('rejects different lengths and values', () => {
    expect(secretsMatch('short', 'longer-secret')).toBe(false)
    expect(secretsMatch('ayc-beta-secret', 'ayc-beta-secreX')).toBe(false)
  })
})
