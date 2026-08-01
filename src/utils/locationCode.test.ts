import { describe, expect, it } from 'vitest'
import { isValidLocationCode, suggestLocationCode, toCompositeCode } from './locationCode'

describe('locationCode', () => {
  it('suggests UCA-style codes from known names', () => {
    expect(suggestLocationCode('University of Central Arkansas')).toMatch(/^[A-Z]{3}$/)
    expect(suggestLocationCode('Pulaski County')).toBe('PUL')
  })

  it('builds namespaced composite codes', () => {
    expect(toCompositeCode('COLLEGE', 'UCA')).toBe('COL-UCA')
    expect(toCompositeCode('HIGH_SCHOOL', 'LRC')).toBe('HSC-LRC')
    expect(toCompositeCode('COUNTY', 'WAS')).toBe('CTY-WAS')
  })

  it('validates three- or four-letter uppercase codes', () => {
    expect(isValidLocationCode('UCA')).toBe(true)
    expect(isValidLocationCode('UAPB')).toBe(true)
    expect(isValidLocationCode('uc')).toBe(false)
  })
})
