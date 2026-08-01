/** Phase 1 domain enums — uppercase snake case per Volume IV. */

export const PERSON_STATUSES = ['ACTIVE', 'PROSPECTIVE', 'INACTIVE', 'ARCHIVED'] as const
export type PersonStatus = (typeof PERSON_STATUSES)[number]

export const PERSON_SOURCES = [
  'LEADER_ENTRY',
  'BETA_IMPORT',
  'MANUAL_ADMIN',
  'JOIN_FORM',
] as const
export type PersonSource = (typeof PERSON_SOURCES)[number]

export const PREFERRED_CONTACT_METHODS = ['TEXT', 'EMAIL', 'EITHER', 'UNKNOWN'] as const
export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number]

export const CONTACT_TYPES = ['EMAIL', 'MOBILE_PHONE'] as const
export type ContactType = (typeof CONTACT_TYPES)[number]

export const CONSENT_STATUSES = ['UNKNOWN', 'GRANTED', 'DENIED', 'NOT_APPLICABLE'] as const
export type ConsentStatus = (typeof CONSENT_STATUSES)[number]

export const LOCATION_TYPES = ['COLLEGE', 'HIGH_SCHOOL', 'COUNTY'] as const
export type LocationType = (typeof LOCATION_TYPES)[number]

export const LOCATION_CODE_PREFIX: Record<LocationType, 'COL' | 'HSC' | 'CTY'> = {
  COLLEGE: 'COL',
  HIGH_SCHOOL: 'HSC',
  COUNTY: 'CTY',
}

export const AFFILIATION_TYPES = [
  'CURRENT_SCHOOL',
  'CURRENT_COLLEGE',
  'COUNTY_RESIDENCE',
  'NON_STUDENT_COUNTY',
  'ORGANIZING_LOCATION',
] as const
export type AffiliationType = (typeof AFFILIATION_TYPES)[number]

export const AFFILIATION_STATUSES = ['ACTIVE', 'ENDED'] as const
export type AffiliationStatus = (typeof AFFILIATION_STATUSES)[number]

export const TEAM_POSITIONS = ['LEAD', 'VOLUNTEER'] as const
export type TeamPosition = (typeof TEAM_POSITIONS)[number]

export const ASSIGNMENT_STATUSES = ['ACTIVE', 'PENDING', 'INACTIVE', 'ENDED'] as const
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number]

export const FEEDBACK_CATEGORIES = [
  'CONFUSING',
  'MISSING_FEATURE',
  'MOBILE_PROBLEM',
  'ERROR',
  'IDEA',
  'PRIVACY_CONCERN',
  'ACCESSIBILITY_PROBLEM',
] as const
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

export const FEEDBACK_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'BLOCKING'] as const
export type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number]

export const FEEDBACK_STATUSES = [
  'NEW',
  'REVIEWING',
  'PLANNED',
  'IN_PROGRESS',
  'RESOLVED',
  'DECLINED',
  'DUPLICATE',
] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export const AUDIT_EVENT_TYPES = [
  'PERSON_CREATED',
  'PERSON_UPDATED',
  'PERSON_STATUS_CHANGED',
  'PERSON_ARCHIVED',
  'PERSON_RESTORED',
  'PERSON_MERGED',
  'CONTACT_METHOD_ADDED',
  'CONTACT_METHOD_UPDATED',
  'LOCATION_CREATED',
  'LOCATION_UPDATED',
  'LOCATION_CODE_CHANGED',
  'TEAM_ASSIGNMENT_CREATED',
  'TEAM_ASSIGNMENT_UPDATED',
  'TEAM_ASSIGNMENT_ENDED',
  'BETA_FEEDBACK_SUBMITTED',
] as const
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number]

export const AUDIT_ENTITY_TYPES = [
  'PERSON',
  'CONTACT_METHOD',
  'LOCATION',
  'TEAM_ASSIGNMENT',
  'BETA_FEEDBACK',
  'TEAM',
] as const
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export const ACTOR_TYPES = ['SYSTEM', 'SHARED_LEADER_SESSION', 'USER', 'ADMIN', 'IMPORT'] as const
export type ActorType = (typeof ACTOR_TYPES)[number]

export const DUPLICATE_RESULTS = [
  'NO_MATCH',
  'POSSIBLE_MATCH',
  'LIKELY_MATCH',
  'EXACT_MATCH',
] as const
export type DuplicateResult = (typeof DUPLICATE_RESULTS)[number]

export const CANONICAL_TEAMS = [
  {
    name: 'Organizer',
    slug: 'organizer',
    code: 'ORG',
    description:
      'Build relationships, recruit members, develop local teams, and help people move from interest to action.',
    displayOrder: 1,
  },
  {
    name: 'Voter Registration',
    slug: 'voter-registration',
    code: 'VRE',
    description:
      'Help young Arkansans understand registration, overcome barriers, and become confident participants in elections.',
    displayOrder: 2,
  },
  {
    name: 'Social Media',
    slug: 'social-media',
    code: 'SOC',
    description:
      'Tell the story of the coalition, elevate youth voices, share opportunities, and make political engagement easier to understand.',
    displayOrder: 3,
  },
  {
    name: 'Events',
    slug: 'events',
    code: 'EVT',
    description:
      'Create social gatherings, leadership experiences, public conversations, trainings, and opportunities to engage policymakers.',
    displayOrder: 4,
  },
  {
    name: 'Outreach',
    slug: 'outreach',
    code: 'OUT',
    description:
      'Build connections with schools, communities, organizations, and young people who have not yet found a place in political life.',
    displayOrder: 5,
  },
] as const
