import { describe, expect, it } from 'vitest'
import { maskEmail, maskPhone, presentContactMethods } from './maskContact.ts'

describe('maskContact', () => {
  it('masks email local part while keeping domain', () => {
    expect(maskEmail('jordan@example.com')).toBe('j••••@example.com')
  })

  it('masks phone leaving last four digits', () => {
    expect(maskPhone('(501) 555-1234')).toBe('•••-•••-1234')
  })

  it('reveals full values only when authorized', () => {
    expect(presentContactMethods('a@b.co', '5015559999', false).email).toContain('•')
    expect(presentContactMethods('a@b.co', '5015559999', true).email).toBe('a@b.co')
  })
})
