import { describe, expect, it } from 'vitest'
import {
  isLocationCategorySlug,
  locationCategoryBoardSlug,
  locationTeamBoardSlug,
  parentBoardSlugForLocationType,
  segmentForLocationType,
} from './locationBoards.ts'

describe('locationBoards', () => {
  it('builds unique board slugs from composite codes', () => {
    expect(locationTeamBoardSlug('COL-UAPB')).toBe('loc-COL-UAPB')
    expect(locationCategoryBoardSlug('HSC-ABC', 'organizer')).toBe('loc-HSC-ABC-organizer')
    expect(isLocationCategorySlug('events')).toBe(true)
    expect(isLocationCategorySlug('graphic-design')).toBe(false)
  })

  it('parents TEAM boards under segment or main', () => {
    expect(parentBoardSlugForLocationType('HIGH_SCHOOL')).toBe('high-school')
    expect(parentBoardSlugForLocationType('COUNTY')).toBe('working-class')
    expect(parentBoardSlugForLocationType('COLLEGE')).toBe('main')
    expect(segmentForLocationType('COUNTY')).toBe('WORKING_CLASS')
  })
})
