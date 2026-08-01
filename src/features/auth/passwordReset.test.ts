import { describe, expect, it } from 'vitest'
import {
  PASSWORD_RESET_PATH,
  passwordResetRedirectTo,
  validateNewPassword,
} from './passwordReset'

describe('passwordReset', () => {
  it('builds redirect URL without double slash', () => {
    expect(passwordResetRedirectTo('https://arkansasyouth.netlify.app')).toBe(
      `https://arkansasyouth.netlify.app${PASSWORD_RESET_PATH}`,
    )
    expect(passwordResetRedirectTo('https://arkansasyouth.netlify.app/')).toBe(
      `https://arkansasyouth.netlify.app${PASSWORD_RESET_PATH}`,
    )
  })

  it('validates password length and match', () => {
    expect(validateNewPassword('short', 'short')).toMatch(/8 characters/)
    expect(validateNewPassword('longenough', 'different!')).toMatch(/do not match/)
    expect(validateNewPassword('longenough', 'longenough')).toBeNull()
  })
})
