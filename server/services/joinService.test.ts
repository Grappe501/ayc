import { describe, expect, it } from 'vitest'
import { suggestLocationCode } from '../domain/locationCodes.ts'
import {
  buildApplicationReferenceCode,
  mapLeadFlags,
  mapLocationInterest,
  mapTeamSlug,
} from './joinService.ts'

describe('join application helpers', () => {
  it('suggests location codes for campus and county names', () => {
    expect(suggestLocationCode('University of Arkansas')).toMatch(/^[A-Z]{3,4}$/)
    expect(suggestLocationCode('Pulaski County')).toMatch(/^[A-Z]{3,4}$/)
  })

  it('maps location interest and team slugs for the applications queue', () => {
    expect(mapLocationInterest('WORKING_CLASS')).toBe('WORKING_CLASS')
    expect(mapLocationInterest('COUNTY')).toBe('WORKING_CLASS')
    expect(mapTeamSlug('graphic-design')).toBe('graphic-design')
    expect(mapTeamSlug('unsure')).toBe('organizer')
  })

  it('maps leadership interest flags', () => {
    expect(mapLeadFlags('local-lead')).toEqual({
      wantsToLeadLocal: true,
      wantsCategoryLead: false,
    })
    expect(mapLeadFlags('category-lead')).toEqual({
      wantsToLeadLocal: false,
      wantsCategoryLead: true,
    })
    expect(mapLeadFlags('volunteer')).toEqual({
      wantsToLeadLocal: false,
      wantsCategoryLead: false,
    })
  })

  it('builds AYC-JA reference codes', () => {
    expect(buildApplicationReferenceCode(128)).toBe('AYC-JA-000128')
  })
})
