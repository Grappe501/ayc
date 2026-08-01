import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

describe('account invite token hashing', () => {
  it('hashes invite codes with sha256 hex', () => {
    const code = 'ABC123DEF0'
    const hash = createHash('sha256').update(code).digest('hex')
    expect(hash).toHaveLength(64)
    expect(hash).toBe(createHash('sha256').update(code).digest('hex'))
  })
})
