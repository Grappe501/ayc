import { describe, expect, it } from 'vitest'
import { OAUTH_CALLBACK_PATH, googleOAuthRedirectTo } from './oauth'

describe('oauth helpers', () => {
  it('builds callback redirect with optional next', () => {
    expect(googleOAuthRedirectTo('https://arkansasyouth.netlify.app')).toBe(
      `https://arkansasyouth.netlify.app${OAUTH_CALLBACK_PATH}`,
    )
    expect(googleOAuthRedirectTo('https://arkansasyouth.netlify.app/', '/leader')).toBe(
      `https://arkansasyouth.netlify.app${OAUTH_CALLBACK_PATH}?next=%2Fleader`,
    )
  })

  it('rejects protocol-relative next paths', () => {
    expect(googleOAuthRedirectTo('https://arkansasyouth.netlify.app', '//evil.example')).toBe(
      `https://arkansasyouth.netlify.app${OAUTH_CALLBACK_PATH}`,
    )
  })
})
