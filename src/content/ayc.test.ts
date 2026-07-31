import { describe, expect, it } from 'vitest'
import { AYC_MISSION, TEAMS } from '../content/ayc'

describe('AYC content', () => {
  it('preserves the canonical mission statement', () => {
    expect(AYC_MISSION).toContain('Youth (16 - 24)')
    expect(AYC_MISSION).toContain('Natural State')
  })

  it('defines five Phase 1 teams', () => {
    expect(TEAMS).toHaveLength(5)
  })
})
