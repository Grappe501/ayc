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
  delete process.env.AYC_KEY_GRAPHIC_DESIGN
  delete process.env.AYC_KEY_HIGH_SCHOOL
  delete process.env.AYC_KEY_WORKING_CLASS
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

  it('registers optional Graphic Design key; Social Media still opens GD', () => {
    process.env.AYC_MASTER_KEY = 'master-key-value-32chars!!!!!!!!'
    process.env.AYC_KEY_SOCIAL_MEDIA = 'social-key-value-32chars!!!!!!!'
    process.env.AYC_KEY_GRAPHIC_DESIGN = 'graphic-key-value-32chars!!!!!!'

    const social = verifyUnlockCode('social-key-value-32chars!!!!!!!')
    expect(social.ok).toBe(true)
    if (social.ok) {
      expect(social.scope).toMatchObject({ kind: 'category', teamSlug: 'social-media' })
      expect(scopeCanAccessTeamBoard(social.scope, 'graphic-design')).toBe(true)
    }

    const graphic = verifyUnlockCode('graphic-key-value-32chars!!!!!!')
    expect(graphic.ok).toBe(true)
    if (graphic.ok) {
      expect(graphic.scope).toMatchObject({ kind: 'category', teamSlug: 'graphic-design' })
      expect(scopeCanAccessTeamBoard(graphic.scope, 'graphic-design')).toBe(true)
      expect(scopeCanAccessTeamBoard(graphic.scope, 'social-media')).toBe(false)
    }
  })

  it('registers segment keys for HS and Working Class shells', () => {
    process.env.AYC_MASTER_KEY = 'master-key-value-32chars!!!!!!!!'
    process.env.AYC_KEY_HIGH_SCHOOL = 'hs-key-value-32chars!!!!!!!!!!!!'
    process.env.AYC_KEY_WORKING_CLASS = 'wc-key-value-32chars!!!!!!!!!!!!'

    const hs = verifyUnlockCode('hs-key-value-32chars!!!!!!!!!!!!')
    expect(hs.ok).toBe(true)
    if (hs.ok) {
      expect(hs.scope).toMatchObject({ kind: 'segment', segment: 'high-school' })
      expect(scopeCanAccessTeamBoard(hs.scope, 'organizer')).toBe(false)
    }

    const wc = verifyUnlockCode('wc-key-value-32chars!!!!!!!!!!!!')
    expect(wc.ok).toBe(true)
    if (wc.ok) {
      expect(wc.scope).toMatchObject({ kind: 'segment', segment: 'working-class' })
    }

    expect(listRegisteredKeys().filter((k) => k.scope.kind === 'segment')).toHaveLength(2)
  })
})
