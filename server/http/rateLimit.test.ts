import { describe, expect, it } from 'vitest'
import { checkRateLimit } from './rateLimit.ts'

describe('checkRateLimit', () => {
  it('allows traffic under the limit and blocks when exceeded', () => {
    const key = `test-${Math.random()}`
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(true)
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(true)
    const blocked = checkRateLimit(key, 2, 60_000)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })
})
