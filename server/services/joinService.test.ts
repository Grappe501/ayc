import { describe, expect, it } from 'vitest'
import { suggestLocationCode } from '../domain/locationCodes.ts'

describe('join application helpers', () => {
  it('suggests location codes for campus and county names', () => {
    expect(suggestLocationCode('University of Arkansas')).toMatch(/^[A-Z]{3,4}$/)
    expect(suggestLocationCode('Pulaski County')).toMatch(/^[A-Z]{3,4}$/)
  })
})
