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
  'TEAM_TASK_CREATED',
  'TEAM_TASK_UPDATED',
  'TEAM_TASK_COMPLETED',
  'TEAM_RESOURCE_CREATED',
  'TEAM_RESOURCE_UPDATED',
  'TEAM_RESOURCE_ARCHIVED',
  'PIPELINE_TAG_ADDED',
  'PIPELINE_TAG_REMOVED',
  'ROLE_GRANTED',
  'ROLE_REVOKED',
  'BETA_FEEDBACK_SUBMITTED',
  'APPLICATION_SUBMITTED',
  'APPLICATION_UPDATED',
  'APPLICATION_ACCEPTED',
  'APPLICATION_DECLINED',
  'CALENDAR_EVENT_CREATED',
  'CALENDAR_EVENT_UPDATED',
  'CALENDAR_EVENT_CANCELLED',
  'CALENDAR_RSVP_INVITED',
  'CALENDAR_RSVP_UPDATED',
  'CALENDAR_RSVP_REMOVED',
  'CALENDAR_OCCURRENCE_CANCELLED',
  'ACCOUNT_INVITED',
  'ACCOUNT_CLAIMED',
  'ACCOUNT_LOGIN',
  'ACCOUNT_DISABLED',
  'BOARD_UNLOCKED',
  'PROFILE_UPDATED',
  'PROFILE_PHOTO_UPDATED',
  'PROFILE_NOTE_CREATED',
  'PROFILE_NOTE_ARCHIVED',
] as const

export const CALENDAR_RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const
export type CalendarRecurrenceFrequency = (typeof CALENDAR_RECURRENCE_FREQUENCIES)[number]
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number]

export const AUDIT_ENTITY_TYPES = [
  'PERSON',
  'CONTACT_METHOD',
  'LOCATION',
  'TEAM_ASSIGNMENT',
  'TEAM_TASK',
  'TEAM_RESOURCE',
  'PIPELINE_TAG',
  'LEADERSHIP_ROLE',
  'BOARD',
  'BETA_FEEDBACK',
  'TEAM',
  'MEMBERSHIP_APPLICATION',
  'CALENDAR',
  'CALENDAR_EVENT',
  'CALENDAR_RSVP',
  'USER_ACCOUNT',
  'ACCOUNT_INVITE',
  'PERSON_PROFILE',
  'PERSON_PROFILE_NOTE',
] as const
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export const ACCOUNT_STATUSES = ['ACTIVE', 'DISABLED'] as const
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const PROFILE_NOTE_VISIBILITIES = ['PUBLIC', 'PRIVATE'] as const
export type ProfileNoteVisibility = (typeof PROFILE_NOTE_VISIBILITIES)[number]

export const CALENDAR_EVENT_STATUSES = ['SCHEDULED', 'CANCELLED'] as const
export type CalendarEventStatus = (typeof CALENDAR_EVENT_STATUSES)[number]

export const CALENDAR_VISIBILITIES = ['INTERNAL', 'PUBLIC'] as const
export type CalendarVisibility = (typeof CALENDAR_VISIBILITIES)[number]

export const CALENDAR_RSVP_STATUSES = ['INVITED', 'YES', 'NO', 'MAYBE'] as const
export type CalendarRsvpStatus = (typeof CALENDAR_RSVP_STATUSES)[number]

/** Phase 2B membership applications queue. */
export const APPLICATION_STATUSES = [
  'NEW',
  'REVIEWING',
  'ACCEPTED',
  'DECLINED',
  'DUPLICATE',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_LOCATION_INTERESTS = [
  'COLLEGE',
  'HIGH_SCHOOL',
  'WORKING_CLASS',
  'UNSURE',
] as const
export type ApplicationLocationInterest = (typeof APPLICATION_LOCATION_INTERESTS)[number]

/** Volume V leadership pipeline — controlled tags only. */
export const PIPELINE_TAGS = [
  'FUTURE_LEADER',
  'NEEDS_MENTORING',
  'READY_TO_LEAD',
  'LOCAL_LEAD_CANDIDATE',
  'CATEGORY_LEAD_CANDIDATE',
] as const
export type PipelineTag = (typeof PIPELINE_TAGS)[number]

export const PIPELINE_TAG_LABELS: Record<PipelineTag, string> = {
  FUTURE_LEADER: 'Future leader',
  NEEDS_MENTORING: 'Needs mentoring',
  READY_TO_LEAD: 'Ready to lead',
  LOCAL_LEAD_CANDIDATE: 'Local lead candidate',
  CATEGORY_LEAD_CANDIDATE: 'Category lead candidate',
}

export const TEAM_TASK_STATUSES = ['OPEN', 'DONE', 'CANCELLED'] as const
export type TeamTaskStatus = (typeof TEAM_TASK_STATUSES)[number]

export const TEAM_TASK_PRIORITIES = ['NORMAL', 'HIGH'] as const
export type TeamTaskPriority = (typeof TEAM_TASK_PRIORITIES)[number]

export const TEAM_RESOURCE_KINDS = ['LINK', 'NOTE', 'TALKING_POINT', 'CHECKLIST'] as const
export type TeamResourceKind = (typeof TEAM_RESOURCE_KINDS)[number]

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
  {
    name: 'Graphic Design',
    slug: 'graphic-design',
    code: 'GRD',
    description:
      'Create clear visuals and design assets for the coalition. Statewide designers sit here under Social Media.',
    displayOrder: 6,
  },
] as const

/** Five statewide category teams (excludes Graphic Design secondary). */
export const STATEWIDE_CATEGORY_SLUGS = [
  'organizer',
  'voter-registration',
  'social-media',
  'events',
  'outreach',
] as const

export const LEADERSHIP_ROLE_CODES = [
  'LEAD_ORGANIZER',
  'CATEGORY_LEAD',
  'GRAPHIC_DESIGN_LEAD',
  'HS_LEAD_ORGANIZER',
  'WC_LEAD_ORGANIZER',
  'LOCATION_LEAD',
  'LOCATION_TEAM_LEAD',
  'VOLUNTEER',
] as const
export type LeadershipRoleCode = (typeof LEADERSHIP_ROLE_CODES)[number]

export const BOARD_KINDS = [
  'MAIN',
  'STATEWIDE_CATEGORY',
  'SECONDARY',
  'SEGMENT',
  'LOCATION_TEAM',
  'LOCATION_CATEGORY',
] as const
export type BoardKind = (typeof BOARD_KINDS)[number]

export const ROLE_SEGMENTS = ['HIGH_SCHOOL', 'WORKING_CLASS', 'COLLEGE', 'ALL'] as const
export type RoleSegment = (typeof ROLE_SEGMENTS)[number]
