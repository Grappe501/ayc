import { ALL_TEAM_BOARDS, type AnyTeamBoardId } from '@/content/boardTeams'

export type TeamMissionSlug = AnyTeamBoardId

export type TeamMissionPack = {
  slug: TeamMissionSlug
  /** One-line charge for the category lead. */
  charge: string
  /** What this team exists to do. */
  purpose: string
  /** How the team advances AYC without rewriting the canonical mission. */
  servesCoalition: string
  focusAreas: string[]
  leadOwns: string[]
  successLooksLike: string[]
}

/**
 * Phase 2 Team Board — Mission content.
 * Team-specific operating language; does not replace the canonical AYC mission.
 */
export const TEAM_MISSIONS: Record<TeamMissionSlug, TeamMissionPack> = {
  organizer: {
    slug: 'organizer',
    charge: 'Turn interest into membership and local leadership.',
    purpose:
      'Organizers build relationships, recruit members, develop local teams, and help people move from curiosity to committed action across Arkansas.',
    servesCoalition:
      'This team grows the human network that makes statewide youth political engagement possible — the people who invite, follow up, and keep local groups alive.',
    focusAreas: [
      'Recruit and orient new members',
      'Identify and support emerging local leads',
      'Keep campus and county teams connected to statewide work',
      'Move prospectives from Join into active roles',
    ],
    leadOwns: [
      'Statewide Organizer roster health and contact gaps',
      'Clear asks for volunteers each week',
      'Hand-offs to Voter Registration, Events, Outreach, and Social Media',
    ],
    successLooksLike: [
      'Every active organizer has phone or email on file',
      'Prospectives are reviewed and placed within a week',
      'Local leads know who to call next',
    ],
  },
  'voter-registration': {
    slug: 'voter-registration',
    charge: 'Make registration and participation clear for young Arkansans.',
    purpose:
      'Voter Registration helps young people understand how to register, overcome barriers, and become confident participants in elections.',
    servesCoalition:
      'This team turns civic curiosity into concrete participation — removing friction so youth voices show up where decisions are made.',
    focusAreas: [
      'Explain registration steps in plain language',
      'Track campus and county registration opportunities',
      'Partner with Organizer and Outreach for turnout',
      'Keep accurate contacts for registration volunteers',
    ],
    leadOwns: [
      'Statewide VR roster and volunteer readiness',
      'Shared talking points and deadline awareness',
      'Coordination with Events for registration tables',
    ],
    successLooksLike: [
      'VR volunteers are text-ready and know their ask',
      'Registration opportunities appear on team calendars (later)',
      'No orphaned VR prospectives without a follow-up',
    ],
  },
  'social-media': {
    slug: 'social-media',
    charge: 'Tell AYC’s story and make engagement easy to understand.',
    purpose:
      'Social Media elevates youth voices, shares opportunities, and shapes how young Arkansans discover the coalition — including Graphic Design as a supporting craft under this team.',
    servesCoalition:
      'This team makes the coalition visible and inviting so young people can find their place and see themselves in the work.',
    focusAreas: [
      'Consistent storytelling across channels',
      'Amplify member voices and local wins',
      'Support Graphic Design for clear visuals',
      'Promote Join, Events, and registration moments',
    ],
    leadOwns: [
      'Statewide Social Media roster and content cadence',
      'Brand-safe messaging aligned with AYC values',
      'Coordination with Events and Organizer for launches',
    ],
    successLooksLike: [
      'Content asks are clear and staffed',
      'Design requests have an owner under Social Media',
      'Join and event posts drive real follow-up',
    ],
  },
  events: {
    slug: 'events',
    charge: 'Create experiences that build belonging and power.',
    purpose:
      'Events designs social gatherings, leadership experiences, public conversations, trainings, and moments where youth meet policymakers.',
    servesCoalition:
      'This team turns relationships into shared experiences — the rooms where confidence, community, and political action grow together.',
    focusAreas: [
      'Plan gatherings that welcome newcomers',
      'Coordinate logistics with Organizer and Outreach',
      'Capture attendance contacts into the Workbench',
      'Prepare hosts and facilitators',
    ],
    leadOwns: [
      'Statewide Events roster and host pipeline',
      'Clear event briefs for Social Media promotion',
      'Post-event follow-up into Organizer / VR',
    ],
    successLooksLike: [
      'Every event has named hosts with contact info',
      'New attendees land as contacts, not lost sign-in sheets',
      'Events reinforce local team growth',
    ],
  },
  outreach: {
    slug: 'outreach',
    charge: 'Open doors for young people who have not found AYC yet.',
    purpose:
      'Outreach builds connections with schools, communities, organizations, and young people who have not yet found a place in political life.',
    servesCoalition:
      'This team widens the doorway — especially for youth outside existing networks — so the coalition reflects all walks of life across the Natural State.',
    focusAreas: [
      'Map schools, campuses, and community partners',
      'Warm introductions into Organizer and local teams',
      'Reach working-class and rural youth pathways',
      'Keep outreach contacts complete and preferred methods set',
    ],
    leadOwns: [
      'Statewide Outreach roster and partner list',
      'First-touch follow-up standards',
      'Hand-offs to Organizer after a successful intro',
    ],
    successLooksLike: [
      'New contacts arrive with location and preferred contact',
      'Partner relationships have a named AYC owner',
      'Outreach feeds Join and team placement, not dead ends',
    ],
  },
  'graphic-design': {
    slug: 'graphic-design',
    charge: 'Make AYC’s message clear, shareable, and on-brand.',
    purpose:
      'Graphic Design creates visuals and design assets for the coalition. Designers statewide sit on this secondary board under Social Media.',
    servesCoalition:
      'This craft makes opportunities and stories easy to recognize — so young people can find AYC and take the next step.',
    focusAreas: [
      'Support Social Media launches with clear visuals',
      'Keep a shared library of reusable templates',
      'Respond to Events and Outreach design asks',
      'Maintain brand-safe color and type choices',
    ],
    leadOwns: [
      'Statewide Graphic Design roster under Social Media',
      'Request intake and turnaround expectations',
      'Hand-offs of finished assets back to Social Media',
    ],
    successLooksLike: [
      'Design requests have an owner and due date',
      'Finished assets land where Social Media can publish',
      'Designers are on the roster with preferred contact',
    ],
  },
}

export function getTeamMission(slug: TeamMissionSlug): TeamMissionPack {
  return TEAM_MISSIONS[slug]
}

/** Guard: every team board entry must have a mission pack. */
export function listTeamMissionSlugs(): TeamMissionSlug[] {
  return ALL_TEAM_BOARDS.map((team) => team.id)
}
