import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  code: text('code').notNull().unique(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  ...timestamps,
  archivedAt: timestamp('archived_at', { withTimezone: true }),
})

export const locations = pgTable(
  'locations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    locationType: text('location_type').notNull(),
    code: text('code').notNull(),
    compositeCode: text('composite_code').notNull().unique(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    shortName: text('short_name'),
    city: text('city'),
    countyName: text('county_name'),
    state: text('state').notNull().default('AR'),
    active: boolean('active').notNull().default(true),
    ...timestamps,
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdByActor: text('created_by_actor'),
    updatedByActor: text('updated_by_actor'),
  },
  (table) => [
    uniqueIndex('locations_type_code_uidx').on(table.locationType, table.code),
    index('locations_normalized_name_idx').on(table.normalizedName),
  ],
)

export const people = pgTable(
  'people',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: text('first_name').notNull(),
    middleName: text('middle_name'),
    lastName: text('last_name').notNull(),
    preferredName: text('preferred_name'),
    displayName: text('display_name'),
    status: text('status').notNull(),
    source: text('source').notNull(),
    preferredContactMethod: text('preferred_contact_method'),
    ...timestamps,
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdByActor: text('created_by_actor'),
    updatedByActor: text('updated_by_actor'),
  },
  (table) => [index('people_status_idx').on(table.status)],
)

export const personContactMethods = pgTable(
  'person_contact_methods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id),
    contactType: text('contact_type').notNull(),
    contactValue: text('contact_value').notNull(),
    normalizedValue: text('normalized_value').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    isVerified: boolean('is_verified').notNull().default(false),
    consentStatus: text('consent_status').notNull().default('UNKNOWN'),
    ...timestamps,
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    index('person_contact_methods_person_idx').on(table.personId),
    index('person_contact_methods_normalized_idx').on(
      table.contactType,
      table.normalizedValue,
    ),
  ],
)

export const personLocationAffiliations = pgTable(
  'person_location_affiliations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    affiliationType: text('affiliation_type').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    status: text('status').notNull().default('ACTIVE'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index('person_location_affiliations_person_idx').on(table.personId)],
)

export const personTeamAssignments = pgTable(
  'person_team_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    personId: uuid('person_id')
      .notNull()
      .references(() => people.id),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    position: text('position').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    status: text('status').notNull().default('ACTIVE'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    ...timestamps,
    assignedByActor: text('assigned_by_actor'),
  },
  (table) => [index('person_team_assignments_person_idx').on(table.personId)],
)

export const betaFeedback = pgTable('beta_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  category: text('category').notNull(),
  pagePath: text('page_path'),
  workflow: text('workflow'),
  description: text('description').notNull(),
  severity: text('severity'),
  status: text('status').notNull().default('NEW'),
  reporterPersonId: uuid('reporter_person_id').references(() => people.id),
  reporterName: text('reporter_name'),
  reporterContact: text('reporter_contact'),
  browserContext: text('browser_context'),
  ...timestamps,
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolutionSummary: text('resolution_summary'),
})

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventType: text('event_type').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    actorType: text('actor_type').notNull(),
    actorId: text('actor_id'),
    actorLabel: text('actor_label'),
    changeSummary: text('change_summary').notNull(),
    metadata: jsonb('metadata'),
    requestId: text('request_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_events_entity_idx').on(table.entityType, table.entityId, table.createdAt),
    index('audit_events_created_at_idx').on(table.createdAt),
  ],
)

export const personMergeHistory = pgTable(
  'person_merge_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    survivingPersonId: uuid('surviving_person_id')
      .notNull()
      .references(() => people.id),
    mergedPersonId: uuid('merged_person_id')
      .notNull()
      .references(() => people.id),
    mergedAt: timestamp('merged_at', { withTimezone: true }).notNull().defaultNow(),
    mergedByActor: text('merged_by_actor'),
    reason: text('reason'),
    summary: text('summary'),
  },
  (table) => [
    uniqueIndex('person_merge_history_merged_uidx').on(table.mergedPersonId),
    index('person_merge_history_surviving_idx').on(table.survivingPersonId, table.mergedAt),
  ],
)

export const teamTasks = pgTable(
  'team_tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id),
    title: text('title').notNull(),
    notes: text('notes'),
    status: text('status').notNull().default('OPEN'),
    priority: text('priority').notNull().default('NORMAL'),
    dueOn: date('due_on'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
    completedAt: timestamp('completed_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdByActor: text('created_by_actor'),
    updatedByActor: text('updated_by_actor'),
  },
  (table) => [index('team_tasks_team_status_idx').on(table.teamId, table.status, table.sortOrder)],
)

export const schemaMigrations = pgTable('schema_migrations', {
  id: text('id').primaryKey(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
})
