import { describe, expect, it } from 'vitest'
import { boardPathForTeamSlug, CANONICAL_BOARDS, getBoardDefinition } from './boards.ts'

describe('canonical boards', () => {
  it('registers Main, five categories, Graphic Design, and two segment shells', () => {
    expect(CANONICAL_BOARDS.map((b) => b.slug)).toEqual([
      'main',
      'organizer',
      'voter-registration',
      'social-media',
      'graphic-design',
      'events',
      'outreach',
      'high-school',
      'working-class',
    ])
    expect(getBoardDefinition('graphic-design')?.parentSlug).toBe('social-media')
    expect(getBoardDefinition('graphic-design')?.kind).toBe('SECONDARY')
    expect(getBoardDefinition('high-school')?.segment).toBe('HIGH_SCHOOL')
  })

  it('routes Graphic Design under Social Media', () => {
    expect(boardPathForTeamSlug('graphic-design')).toBe(
      '/leader/teams/social-media/graphic-design',
    )
    expect(boardPathForTeamSlug('events')).toBe('/leader/teams/events')
  })
})
