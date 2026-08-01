import { afterEach, describe, expect, it } from 'vitest'
import {
  listRegisteredKeys,
  resolveKey,
  secretsMatch,
  scopeCanAccessTeamBoard,
  verifyUnlockCode,
} from './auth.ts'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  delete process.env.AYC_MASTER_KEY
  delete process.env.AYC_LEADER_WRITE_SECRET
  delete process.env.AYC_KEY_SOCIAL_MEDIA
  delete process.env.AYC_KEY_ORGANIZER
})

describe('secretsMatch', () => {
  it('accepts identical secrets', () => {
    expect(secretsMatch('ayc-beta-secret', 'ayc-beta-secret')).toBe(true)
  })

  it('rejects different lengths and values', () => {
    expect(secretsMatch('short', 'longer-secret')).toBe(false)
    expect(secretsMatch('ayc-beta-secret', 'ayc-beta-secreX')).toBe(false)
  })
})

describe('key hierarchy', () => {
  it('resolves master and category keys', () => {
    process.env.AYC_MASTER_KEY = 'master-key-value-32chars!!!!!!!!'
    process.env.AYC_KEY_SOCIAL_MEDIA = 'social-key-value-32chars!!!!!!!'
    const keys = listRegisteredKeys()
    expect(keys.some((k) => k.scope.kind === 'master')).toBe(true)
    expect(keys.some((k) => k.scope.kind === 'category')).toBe(true)

    const master = resolveKey('master-key-value-32chars!!!!!!!!')
    expect(master?.scope.kind).toBe('master')

    const social = verifyUnlockCode('social-key-value-32chars!!!!!!!')
    expect(social.ok).toBe(true)
    if (social.ok) {
      expect(social.scope.kind).toBe('category')
      expect(scopeCanAccessTeamBoard(social.scope, 'social-media')).toBe(true)
      expect(scopeCanAccessTeamBoard(social.scope, 'events')).toBe(false)
    }
  })

  it('accepts AYC_LEADER_WRITE_SECRET as master alias', () => {
    process.env.AYC_LEADER_WRITE_SECRET = 'legacy-master-secret-value!!!!!'
    const result = verifyUnlockCode('legacy-master-secret-value!!!!!')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.scope.kind).toBe('master')
  })
})
