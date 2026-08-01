import type { AnyTeamBoardId } from '@/content/boardTeams'

export type TeamResourceStarter = {
  title: string
  kind: 'LINK' | 'NOTE' | 'TALKING_POINT' | 'CHECKLIST'
  url?: string | null
  notes?: string | null
}

type TeamSlug = AnyTeamBoardId

/** Suggested starters for empty team resource libraries (not auto-inserted). */
export const TEAM_RESOURCE_STARTERS: Record<TeamSlug, TeamResourceStarter[]> = {
  organizer: [
    {
      title: 'Public Join form',
      kind: 'LINK',
      url: '/join',
      notes: 'Send newcomers here to become Prospectives.',
    },
    {
      title: 'Contact gap fill',
      kind: 'LINK',
      url: '/leader/gaps',
      notes: 'Clear missing phone/email on the roster.',
    },
    {
      title: 'Opening ask',
      kind: 'TALKING_POINT',
      notes:
        'AYC is a statewide network of young Arkansans ages 16–24 building political engagement through relationships, voting, and action.',
    },
  ],
  'voter-registration': [
    {
      title: 'Public Join form',
      kind: 'LINK',
      url: '/join',
    },
    {
      title: 'Registration barrier check',
      kind: 'CHECKLIST',
      notes: 'ID · address · deadline · where to turn in · who follows up.',
    },
    {
      title: 'Plain-language pitch',
      kind: 'TALKING_POINT',
      notes: 'Registration is the first step from caring about issues to having a say in who decides.',
    },
  ],
  'social-media': [
    {
      title: 'Landing page',
      kind: 'LINK',
      url: '/',
      notes: 'Vision + Join CTA for share posts.',
    },
    {
      title: 'Brand palette note',
      kind: 'NOTE',
      notes: 'Dominant green #2E5A3D · secondary #FF6B35 · keep posts readable on phone.',
    },
    {
      title: 'Share caption starter',
      kind: 'TALKING_POINT',
      notes: 'Young Arkansans deserve a real seat at the table — join AYC and help build it.',
    },
  ],
  events: [
    {
      title: 'Add a host contact',
      kind: 'LINK',
      url: '/leader/contacts/new',
      notes: 'Every event needs a named host in the Workbench.',
    },
    {
      title: 'Event run-of-show',
      kind: 'CHECKLIST',
      notes: 'Host · welcome · agenda · signup capture · follow-up owner · Social Media ask.',
    },
    {
      title: 'Welcome line',
      kind: 'TALKING_POINT',
      notes: 'You belong here — tonight is about meeting people and taking one next step together.',
    },
  ],
  outreach: [
    {
      title: 'Directory',
      kind: 'LINK',
      url: '/directory',
      notes: 'Find who already covers a school or county.',
    },
    {
      title: 'First-touch script',
      kind: 'TALKING_POINT',
      notes:
        'We help young people find a place in political life — would you introduce us to students or youth who might want in?',
    },
    {
      title: 'Partner follow-up',
      kind: 'CHECKLIST',
      notes: 'Thank-you · AYC one-pager · Join link · named Organizer hand-off.',
    },
  ],
  'graphic-design': [
    {
      title: 'Social Media parent board',
      kind: 'LINK',
      url: '/leader/teams/social-media',
      notes: 'Graphic Design rolls up under Social Media.',
    },
    {
      title: 'Brand palette note',
      kind: 'NOTE',
      notes: 'Dominant green #2E5A3D · secondary #FF6B35 · keep type readable on phone.',
    },
    {
      title: 'Asset hand-off checklist',
      kind: 'CHECKLIST',
      notes: 'Final file · alt text · where it posts · Social Media owner notified.',
    },
  ],
}

export function getTeamResourceStarters(slug: TeamSlug): TeamResourceStarter[] {
  return TEAM_RESOURCE_STARTERS[slug] ?? []
}
