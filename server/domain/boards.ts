export type BoardDefinition = {
  kind: 'MAIN' | 'STATEWIDE_CATEGORY' | 'SECONDARY' | 'SEGMENT'
  slug: string
  name: string
  parentSlug: string | null
  teamSlug: string | null
  segment: 'HIGH_SCHOOL' | 'WORKING_CLASS' | null
  path: string
}

/** Canonical Phase 2A board registry (location boards seed later in 2E). */
export const CANONICAL_BOARDS: BoardDefinition[] = [
  {
    kind: 'MAIN',
    slug: 'main',
    name: 'Lead Organizer Board',
    parentSlug: null,
    teamSlug: null,
    segment: null,
    path: '/leader',
  },
  {
    kind: 'STATEWIDE_CATEGORY',
    slug: 'organizer',
    name: 'Organizer Lead Board',
    parentSlug: 'main',
    teamSlug: 'organizer',
    segment: null,
    path: '/leader/teams/organizer',
  },
  {
    kind: 'STATEWIDE_CATEGORY',
    slug: 'voter-registration',
    name: 'Voter Registration Lead Board',
    parentSlug: 'main',
    teamSlug: 'voter-registration',
    segment: null,
    path: '/leader/teams/voter-registration',
  },
  {
    kind: 'STATEWIDE_CATEGORY',
    slug: 'social-media',
    name: 'Social Media Lead Board',
    parentSlug: 'main',
    teamSlug: 'social-media',
    segment: null,
    path: '/leader/teams/social-media',
  },
  {
    kind: 'SECONDARY',
    slug: 'graphic-design',
    name: 'Graphic Design Lead Board',
    parentSlug: 'social-media',
    teamSlug: 'graphic-design',
    segment: null,
    path: '/leader/teams/social-media/graphic-design',
  },
  {
    kind: 'STATEWIDE_CATEGORY',
    slug: 'events',
    name: 'Events Lead Board',
    parentSlug: 'main',
    teamSlug: 'events',
    segment: null,
    path: '/leader/teams/events',
  },
  {
    kind: 'STATEWIDE_CATEGORY',
    slug: 'outreach',
    name: 'Outreach Lead Board',
    parentSlug: 'main',
    teamSlug: 'outreach',
    segment: null,
    path: '/leader/teams/outreach',
  },
  {
    kind: 'SEGMENT',
    slug: 'high-school',
    name: 'High School Lead Organizer Board',
    parentSlug: 'main',
    teamSlug: null,
    segment: 'HIGH_SCHOOL',
    path: '/leader/segments/high-school',
  },
  {
    kind: 'SEGMENT',
    slug: 'working-class',
    name: 'Working Class Lead Organizer Board',
    parentSlug: 'main',
    teamSlug: null,
    segment: 'WORKING_CLASS',
    path: '/leader/segments/working-class',
  },
]

export function getBoardDefinition(slug: string): BoardDefinition | undefined {
  return CANONICAL_BOARDS.find((board) => board.slug === slug)
}

export function boardPathForTeamSlug(teamSlug: string): string {
  if (teamSlug === 'graphic-design') return '/leader/teams/social-media/graphic-design'
  return `/leader/teams/${teamSlug}`
}
