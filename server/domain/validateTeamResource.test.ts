import { describe, expect, it } from 'vitest'
import { validateTeamResourceCreate } from './validateTeamResource.ts'

describe('validateTeamResourceCreate', () => {
  it('requires a URL for LINK resources', () => {
    const result = validateTeamResourceCreate({
      title: 'Toolkit',
      kind: 'LINK',
    })
    expect(result.ok).toBe(false)
  })

  it('accepts a talking point with notes', () => {
    const result = validateTeamResourceCreate({
      title: 'Why AYC',
      kind: 'TALKING_POINT',
      notes: 'Youth 16–24 want meaningful participation.',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.kind).toBe('TALKING_POINT')
      expect(result.value.url).toBeNull()
    }
  })

  it('accepts http(s) and site paths', () => {
    expect(
      validateTeamResourceCreate({
        title: 'Join',
        kind: 'LINK',
        url: '/join',
      }).ok,
    ).toBe(true)
    expect(
      validateTeamResourceCreate({
        title: 'Docs',
        kind: 'LINK',
        url: 'https://example.com/guide',
      }).ok,
    ).toBe(true)
  })
})
