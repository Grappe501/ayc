import { describe, expect, it } from 'vitest'
import {
  isValidLocationCode,
  parseCompositeCode,
  suggestLocationCode,
  toCompositeCode,
} from './locationCodes.ts'

describe('locationCodes', () => {
  it('suggests three-letter codes', () => {
    expect(suggestLocationCode('Pulaski County')).toBe('PUL')
    expect(suggestLocationCode('University of Central Arkansas')).toMatch(/^[A-Z]{3}$/)
  })

  it('builds and parses composite codes', () => {
    expect(toCompositeCode('COLLEGE', 'UCA')).toBe('COL-UCA')
    expect(parseCompositeCode('HSC-LRC')).toEqual({
      locationType: 'HIGH_SCHOOL',
      code: 'LRC',
    })
    expect(isValidLocationCode('UCA')).toBe(true)
    expect(isValidLocationCode('UAPB')).toBe(true)
    expect(parseCompositeCode('COL-UAPB')).toEqual({
      locationType: 'COLLEGE',
      code: 'UAPB',
    })
  })
})
