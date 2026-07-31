# Arkansas Youth Coalition
# Volume IV
# Data Architecture

**Version:** 1.0  
**Status:** Governing data constitution  
**Platform:** AYC Leadership Workbench  
**Primary database:** PostgreSQL  
**Initial scope:** Phase 1 leadership contact system  
**Future scope:** Statewide youth leadership operating system

---

# 1. Purpose

This volume establishes the canonical data architecture for the Arkansas Youth Coalition Workbench.

It governs:

- People records
- Contact information
- Locations
- Three-letter location codes
- Teams
- Positions
- Participation status
- Contact-to-team relationships
- Duplicate detection
- Audit records
- Beta feedback
- Data ownership
- Data retention
- Privacy boundaries
- Migration standards
- Future schema expansion

The purpose of this architecture is to ensure that AYC maintains one reliable source of truth as the organization grows.

The first release may contain only a small number of records and workflows. The data foundation must still be capable of supporting future team boards, individual accounts, events, volunteer activity, communications, leadership development, regional organization, and statewide reporting.

---

# 2. Governing Data Doctrine

## 2.1 One person, one canonical record

A person should have one primary record within the system.

The same individual must not become a different person merely because they:

- Join another team
- Change schools
- Move to another county
- Become a team lead
- Attend an event
- Volunteer in another program
- Create a user account later

Future features should connect to the existing canonical person record.

## 2.2 Relationships belong in relationship tables

A person may belong to several teams, serve in several locations, attend many events, and hold different roles over time.

These relationships must not be compressed into comma-separated text fields.

## 2.3 Preserve history

The database should preserve meaningful organizational history.

Records should usually be:

- Updated
- Deactivated
- Archived
- Superseded

They should not be casually deleted.

## 2.4 Collect only useful information

Every field must have a defined organizational purpose.

The database must not become a warehouse for unnecessary personal details.

## 2.5 Separate identity from participation

A person is not the same thing as:

- Their team assignment
- Their leadership position
- Their school
- Their account
- Their volunteer activity
- Their current status

Those are related records that can change independently.

## 2.6 Design for progressive maturity

Phase 1 uses a simple leader-entered contact list.

Future phases may add:

- Individual accounts
- Self-service profile updates
- Team-leader administration
- Event participation
- Training records
- Volunteer hours
- Communication consent
- Regional structures

The Phase 1 schema must not block these additions.

---

# 3. Data Classification

AYC data should be classified according to sensitivity.

## 3.1 Public organizational data

Examples:

- Team names
- General organizational descriptions
- Public event information
- Public resources
- Approved public leader biographies

This information may eventually appear on a public website.

## 3.2 Internal operational data

Examples:

- Team assignments
- Location membership
- Participation status
- Leadership position
- Internal workflow status
- Beta feedback

This information belongs inside the protected workbench.

## 3.3 Personal contact data

Examples:

- Email address
- Mobile phone number
- Preferred contact method

This information requires stronger access controls and should not appear in general public views.

## 3.4 Restricted data

Examples:

- Private notes
- Consent records
- Account security information
- Youth-protection records
- Sensitive incident records
- Administrative audit data

Restricted data must be accessible only to specifically authorized roles in future phases.

Phase 1 should avoid collecting restricted information unless it is essential.

---

# 4. Canonical Entity Map

The Phase 1 data model centers on the following entities:

```text
Person
  |
  +---- Person Contact Method
  |
  +---- Person Location Affiliation
  |
  +---- Person Team Assignment
  |
  +---- Participation Status
  |
  +---- Audit Event

Location
  |
  +---- Location Code
  |
  +---- Location Type
  |
  +---- Person Location Affiliation

Team
  |
  +---- Person Team Assignment

Beta Feedback
  |
  +---- Optional Person Reference
  |
  +---- Workflow or Page Reference

Audit Event
  |
  +---- Entity Type
  |
  +---- Entity ID
```

The first implementation may simplify some physical tables while preserving these conceptual boundaries.

---

# 5. Identifier Standards

Every major record should use a stable internal identifier.

Recommended format:

```text
UUID
```

Examples:

```text
person.id
location.id
team.id
person_team_assignment.id
audit_event.id
beta_feedback.id
```

Internal identifiers must not depend on:

- A person’s name
- Email address
- Phone number
- School
- County
- Team
- Three-letter code

Names, contact details, affiliations, and codes can change. Internal identifiers should remain stable.

## 5.1 Public-facing identifiers

Some entities may also receive a human-readable identifier.

Examples:

```text
Location composite code: COL-UCA
Team slug: voter-registration
Feedback reference: AYC-FB-000128
```

These values should be separate from internal database IDs.

---

# 6. Naming Conventions

## Database tables

Use lowercase plural snake case:

```text
people
person_contact_methods
locations
person_location_affiliations
teams
person_team_assignments
audit_events
beta_feedback
```

## Database columns

Use lowercase snake case:

```text
first_name
last_name
created_at
updated_at
archived_at
location_type
is_primary
```

## TypeScript fields

Application code may use camelCase:

```text
firstName
lastName
createdAt
locationType
isPrimary
```

Conversion between database and application naming should occur in controlled repository or mapping layers.

## Enum values

Use uppercase snake case:

```text
ACTIVE
PROSPECTIVE
INACTIVE
ARCHIVED
COLLEGE
HIGH_SCHOOL
COUNTY
LEAD
VOLUNTEER
```

## Human-facing labels

Use readable title case:

```text
Voter Registration
High School
Team Lead
Preferred Contact Method
```

---

# 7. Canonical People Record

## Table: `people`

This is the central identity record for each person known to AYC.

Recommended fields:

```text
id
first_name
middle_name
last_name
preferred_name
display_name
status
source
created_at
updated_at
archived_at
created_by_actor
updated_by_actor
```

## 7.1 Required fields

Phase 1 requires:

```text
first_name
last_name
status
source
created_at
updated_at
```

## 7.2 Optional fields

```text
middle_name
preferred_name
display_name
archived_at
```

## 7.3 Display name

The system may derive a display name from:

```text
preferred_name + last_name
```

or:

```text
first_name + last_name
```

A manually entered display name should be used only when necessary.

## 7.4 Person source

The `source` field identifies how the person first entered the system.

Initial values:

```text
LEADER_ENTRY
BETA_IMPORT
MANUAL_ADMIN
```

Future values may include:

```text
SELF_REGISTRATION
EVENT_SIGNUP
TEAM_INVITATION
VOLUNTEER_FORM
DATA_IMPORT
PARTNER_REFERRAL
```

The source should describe acquisition, not current ownership.

## 7.5 Person status

Recommended values:

```text
ACTIVE
PROSPECTIVE
INACTIVE
ARCHIVED
```

Definitions:

### ACTIVE

Currently involved or available for AYC activity.

### PROSPECTIVE

Known to AYC but not yet fully active.

### INACTIVE

Previously involved or temporarily not participating.

### ARCHIVED

Removed from active operational views but retained for history and duplicate prevention.

Status changes should be recorded in the audit log.

---

# 8. Contact Methods

The system should conceptually support more than one contact method per person.

## Table: `person_contact_methods`

Recommended fields:

```text
id
person_id
contact_type
contact_value
normalized_value
is_primary
is_verified
consent_status
created_at
updated_at
archived_at
```

## 8.1 Contact types

Initial values:

```text
EMAIL
MOBILE_PHONE
```

Future values may include:

```text
ALTERNATE_EMAIL
ALTERNATE_PHONE
SIGNAL
WHATSAPP
SOCIAL_HANDLE
```

Social handles should not be added until a demonstrated need exists.

## 8.2 Normalized values

Email normalization:

```text
lowercase
trim surrounding spaces
```

Phone normalization:

```text
digits only
country code when known
```

Example:

```text
Displayed: (501) 555-1234
Normalized: 15015551234
```

The normalized value is used for matching and duplicate detection.

## 8.3 Primary contact method

A person may have:

- One primary email
- One primary mobile number
- One overall preferred contact channel

The database should not allow multiple primary records of the same contact type for the same person.

## 8.4 Verification

Phase 1 may leave `is_verified` false unless the leader directly confirms the information.

Future verification may include:

- Email confirmation
- Text confirmation
- User-account verification
- Leader confirmation

Verification must not be implied merely because a value was entered.

---

# 9. Communication Preference

The person record or a related communication-preference record should support:

```text
TEXT
EMAIL
EITHER
UNKNOWN
```

Future communication consent should be stored separately from preference.

Preference answers:

> How does this person prefer to be contacted?

Consent answers:

> What communication has this person authorized AYC to send?

These are not the same question.

Phase 1 may collect preferred contact method but should not treat that selection as legal consent for bulk email or text messaging.

---

# 10. Locations

## Table: `locations`

A location represents a college, high school, county, or future organizational geography.

Recommended fields:

```text
id
location_type
code
composite_code
name
normalized_name
short_name
city
county_name
state
active
created_at
updated_at
archived_at
created_by_actor
updated_by_actor
```

## 10.1 Initial location types

```text
COLLEGE
HIGH_SCHOOL
COUNTY
```

Future location types may include:

```text
CITY
REGION
CONGRESSIONAL_DISTRICT
CHAPTER
COMMUNITY_ORGANIZATION
```

New types require a documented schema and product decision.

## 10.2 Location name

The `name` field stores the formal display name.

Examples:

```text
University of Central Arkansas
Little Rock Central High School
Pulaski County
```

## 10.3 Short name

Examples:

```text
UCA
Little Rock Central
Pulaski
```

The short name improves compact mobile display.

## 10.4 Normalized name

The normalized name supports duplicate detection.

Normalization may include:

- Lowercase
- Trim spaces
- Remove repeated spaces
- Normalize punctuation
- Normalize common terms such as `High School`

The original display name must still be preserved.

---

# 11. Three-Letter Code System

Every location receives a three-letter display code within a location-type namespace.

## 11.1 Namespace prefixes

```text
COL = College
HSC = High School
CTY = County
```

## 11.2 Code fields

```text
code
composite_code
```

Examples:

```text
code: UCA
composite_code: COL-UCA
```

```text
code: LRC
composite_code: HSC-LRC
```

```text
code: PUL
composite_code: CTY-PUL
```

## 11.3 Uniqueness rules

The three-letter code must be unique within its location type.

The composite code must be globally unique.

Valid:

```text
COL-WAS
CTY-WAS
```

Not valid:

```text
CTY-WAS
CTY-WAS
```

## 11.4 Code format

The display code must:

- Contain exactly three uppercase letters
- Contain no spaces
- Contain no numbers
- Contain no punctuation
- Be manually reviewable
- Remain stable after regular use begins

## 11.5 Code generation

The system may suggest a code based on:

- Established institutional abbreviation
- First three recognizable letters
- Initial letters of major name words
- Common community abbreviation

The leader must be able to approve or override the suggestion before creation.

## 11.6 Code changes

Location codes should not be casually changed after they appear in reports or workflows.

If a code must change:

- Preserve the internal location ID
- Record the old code
- Create an alias or history record
- Update dependent display references
- Record the change in the audit log

Future table:

```text
location_code_history
```

Recommended fields:

```text
id
location_id
old_code
new_code
changed_at
changed_by_actor
reason
```

This table may be deferred until the first real code change is required.

---

# 12. Person Location Affiliations

A person may be associated with more than one location over time.

Examples:

- Attends a college
- Lives in a county
- Graduated from a high school
- Organizes in a different county
- Transfers schools

## Table: `person_location_affiliations`

Recommended fields:

```text
id
person_id
location_id
affiliation_type
is_primary
status
started_at
ended_at
created_at
updated_at
```

## 12.1 Initial affiliation types

```text
CURRENT_SCHOOL
CURRENT_COLLEGE
COUNTY_RESIDENCE
NON_STUDENT_COUNTY
ORGANIZING_LOCATION
```

For the simplest Phase 1 interface, the user chooses one primary category:

```text
College
High School
County / Non-Student
```

The database should still preserve the ability to add future affiliations.

## 12.2 Primary location

A person may have one primary operational location at a time.

The system should enforce no more than one active `is_primary = true` affiliation per person.

## 12.3 Historical affiliations

When a person changes schools or locations, the old affiliation should be ended rather than overwritten when the history is organizationally meaningful.

---

# 13. Teams

## Table: `teams`

Teams must be stored as canonical records rather than repeated free text.

Recommended fields:

```text
id
name
slug
code
description
active
display_order
created_at
updated_at
archived_at
```

## 13.1 Initial teams

```text
Organizer
Voter Registration
Social Media
Events
Outreach
```

Suggested slugs:

```text
organizer
voter-registration
social-media
events
outreach
```

Suggested optional codes:

```text
ORG
VRE
SOC
EVT
OUT
```

Team codes are internal conveniences and should not be confused with the location code system.

## 13.2 Team names

Changing a team’s display name should not require changing its internal ID.

The slug should remain stable when possible.

## 13.3 Team status

Teams should be activated or archived rather than deleted.

---

# 14. Person Team Assignments

A person may belong to one or more teams.

## Table: `person_team_assignments`

Recommended fields:

```text
id
person_id
team_id
position
is_primary
status
started_at
ended_at
created_at
updated_at
assigned_by_actor
```

## 14.1 Initial position values

```text
LEAD
VOLUNTEER
```

Future values may include:

```text
COORDINATOR
DEPUTY_LEAD
ADVISER
MENTOR
STAFF
INTERN
MEMBER
```

Future additions require product approval.

## 14.2 Assignment status

```text
ACTIVE
PENDING
INACTIVE
ENDED
```

The person’s overall status and team-assignment status are separate.

A person may remain active in AYC while leaving one team.

## 14.3 Primary team

A person may have one primary active team assignment.

Additional assignments may be active but marked non-primary.

## 14.4 Historical assignments

When someone changes teams or positions:

- End the previous assignment when history matters
- Create or activate the new assignment
- Preserve dates
- Record the change in the audit log

Do not overwrite every past team role with the newest one.

---

# 15. Phase 1 Simplified Contact View

The Phase 1 interface may display one combined contact record:

```text
First name
Last name
Email
Phone
Preferred contact method
Primary location
Primary team
Additional teams
Position
Status
```

This is a user-facing composition of several canonical entities:

```text
people
person_contact_methods
person_location_affiliations
person_team_assignments
```

The frontend may present one simple form while the server saves the related records transactionally.

---

# 16. Database Transaction for Contact Creation

Creating a contact should follow this sequence:

```text
1. Validate request
2. Normalize email and phone
3. Search for likely duplicates
4. Confirm or create location
5. Create person
6. Create contact methods
7. Create primary location affiliation
8. Create primary team assignment
9. Create additional team assignments
10. Create audit event
11. Commit transaction
```

If any required step fails, the transaction should roll back.

The database must not create a person record without the related required location and team assignment because of a partial failure.

---

# 17. Duplicate Detection

Duplicate detection protects data quality but must not block legitimate people who share similar names.

## 17.1 Exact-match indicators

Strong duplicate signals:

- Same normalized email
- Same normalized phone number
- Same external account identifier in future phases

These should normally trigger a duplicate warning or block.

## 17.2 Combined-match indicators

Moderate duplicate signals:

- Same first and last name plus same location
- Same preferred name and last name plus same phone suffix
- Same name plus same email domain and team
- Same name plus prior archived record

These should trigger a review warning.

## 17.3 Weak indicators

Weak signals:

- Same last name
- Similar first name
- Same school
- Same county

Weak signals must never automatically block creation.

## 17.4 Duplicate review result

Possible outcomes:

```text
NO_MATCH
POSSIBLE_MATCH
LIKELY_MATCH
EXACT_MATCH
```

## 17.5 Duplicate behavior

### NO_MATCH

Allow creation.

### POSSIBLE_MATCH

Show candidates and allow leader confirmation.

### LIKELY_MATCH

Require explicit confirmation or use existing record.

### EXACT_MATCH

Block automatic duplication and direct the leader to the existing record.

## 17.6 Archived records

Archived people must remain part of duplicate detection.

The system should suggest restoring or updating the archived record instead of creating a duplicate.

---

# 18. Merge Strategy

Phase 1 does not need a full merge interface, but the architecture must anticipate duplicate resolution.

Future merge behavior should:

- Select one surviving person record
- Move valid contact methods
- Move team assignments
- Move location affiliations
- Preserve event and activity history
- Record source record IDs
- Archive merged records
- Create an audit event
- Never silently discard conflicting information

Future table:

```text
person_merge_history
```

Suggested fields:

```text
id
surviving_person_id
merged_person_id
merged_at
merged_by_actor
reason
summary
```

---

# 19. Contact Status and Lifecycle

A person record follows a controlled lifecycle.

```text
PROSPECTIVE
    |
    v
ACTIVE
    |
    +----> INACTIVE
    |
    +----> ARCHIVED
```

Possible restoration:

```text
INACTIVE -> ACTIVE
ARCHIVED -> ACTIVE
ARCHIVED -> PROSPECTIVE
```

Status rules should be enforced in a service layer rather than scattered across interfaces.

## 19.1 Archive behavior

Archiving a person should:

- Remove them from default active directory views
- Preserve contact methods
- Preserve team history
- Preserve location history
- Preserve audit history
- Prevent accidental communication in future systems
- Keep the record available for authorized restoration

## 19.2 Permanent deletion

Permanent deletion should be reserved for:

- Legally required deletion
- Verified duplicate cleanup after merge
- Test records
- Data entered in error where retention has no legitimate purpose

Permanent deletion must be separately authorized and audited in future phases.

---

# 20. Notes Architecture

A free-form notes field creates substantial risk.

Phase 1 should either omit general notes or limit them sharply.

Recommended alternative fields:

```text
follow_up_needed
follow_up_summary
internal_context
```

Even these fields should have guidance.

Prohibited note content should include:

- Rumors
- Medical information
- Political ideology judgments
- Sensitive family information
- Unverified accusations
- School disciplinary information
- Private personal conflicts
- Government identification numbers

Future sensitive-case documentation should use a separately governed restricted system, not the general contact directory.

---

# 21. Beta Feedback

## Table: `beta_feedback`

Recommended fields:

```text
id
reference_code
category
page_path
workflow
description
severity
status
reporter_person_id
reporter_name
reporter_contact
browser_context
created_at
updated_at
resolved_at
resolution_summary
```

## 21.1 Feedback categories

```text
CONFUSING
MISSING_FEATURE
MOBILE_PROBLEM
ERROR
IDEA
PRIVACY_CONCERN
ACCESSIBILITY_PROBLEM
```

## 21.2 Severity

```text
LOW
MEDIUM
HIGH
BLOCKING
```

The user may not need to select severity. The leadership or development team can assign it during review.

## 21.3 Feedback status

```text
NEW
REVIEWING
PLANNED
IN_PROGRESS
RESOLVED
DECLINED
DUPLICATE
```

## 21.4 Reporter privacy

Reporter identity should be optional unless follow-up is required.

Feedback should not automatically expose personal contact information in general dashboards.

---

# 22. Audit Events

## Table: `audit_events`

Recommended fields:

```text
id
event_type
entity_type
entity_id
actor_type
actor_id
actor_label
change_summary
metadata
request_id
created_at
```

## 22.1 Initial event types

```text
PERSON_CREATED
PERSON_UPDATED
PERSON_STATUS_CHANGED
PERSON_ARCHIVED
PERSON_RESTORED
CONTACT_METHOD_ADDED
CONTACT_METHOD_UPDATED
LOCATION_CREATED
LOCATION_UPDATED
LOCATION_CODE_CHANGED
TEAM_ASSIGNMENT_CREATED
TEAM_ASSIGNMENT_UPDATED
TEAM_ASSIGNMENT_ENDED
BETA_FEEDBACK_SUBMITTED
```

## 22.2 Actor types

```text
SYSTEM
SHARED_LEADER_SESSION
USER
ADMIN
IMPORT
```

Phase 1 will primarily use:

```text
SHARED_LEADER_SESSION
SYSTEM
```

Future authenticated activity should reference a user account.

## 22.3 Change summaries

Audit summaries should be useful but privacy-conscious.

Good:

```text
Updated primary team from Events to Organizer.
```

Avoid:

```text
Changed phone from 5015551234 to 5015559988.
```

Sensitive values should be excluded or masked.

## 22.4 Metadata

The `metadata` field may use JSON for safe structured context.

It must not become an uncontrolled duplicate copy of full records.

---

# 23. User Accounts

Individual user accounts are deferred from Phase 1, but the data architecture must anticipate them.

Future table:

```text
user_accounts
```

Suggested fields:

```text
id
person_id
auth_provider
auth_subject
email
account_status
last_login_at
created_at
updated_at
disabled_at
```

A user account should reference a person record.

A person may exist without a user account.

A user account should not become a second duplicate person database.

---

# 24. Roles and Permissions

Future role tables should remain separate from team positions.

A team position answers:

> What does this person do in the organization?

A permission role answers:

> What may this account access or change?

These must not be treated as identical.

Future tables:

```text
roles
permissions
user_role_assignments
role_permissions
```

Possible role values:

```text
SYSTEM_ADMIN
AYC_DIRECTOR
LEADERSHIP_BOARD
TEAM_LEAD
LOCATION_LEAD
VOLUNTEER
VIEW_ONLY
```

Permission examples:

```text
person.read
person.create
person.update
person.archive
contact.reveal
team.manage
location.manage
feedback.review
audit.read
```

---

# 25. Communication Consent

Future email and text systems must not infer consent from the existence of a phone number or email address.

Future table:

```text
communication_consents
```

Suggested fields:

```text
id
person_id
channel
consent_status
consent_source
consent_text_version
granted_at
revoked_at
recorded_by_actor
created_at
updated_at
```

Channels:

```text
EMAIL
SMS
VOICE
```

Consent statuses:

```text
UNKNOWN
OPTED_IN
OPTED_OUT
REVOKED
```

The system must preserve opt-out history.

---

# 26. Events and Attendance Expansion

Future event architecture should connect to canonical people and locations.

Potential tables:

```text
events
event_locations
event_registrations
event_attendance
event_roles
event_follow_up
```

A person attending an event must reference `people.id`.

The event system must not create a separate event-only contact database.

---

# 27. Volunteer Activity Expansion

Future volunteer tracking may include:

```text
volunteer_activities
volunteer_hours
service_categories
activity_verifications
```

Suggested core relationship:

```text
person_id
team_id
location_id
event_id
activity_date
hours
description
verification_status
```

Volunteer activity must remain separate from contact identity.

---

# 28. Leadership Development Expansion

Future training and leadership records may include:

```text
learning_paths
courses
course_enrollments
course_completions
leadership_milestones
mentor_assignments
badges
recognitions
```

Every enrollment and achievement should reference the canonical person record.

Recognition should measure participation and development without exposing private evaluation data unnecessarily.

---

# 29. Regional Structure Expansion

Future geographic organization may require:

```text
regions
location_region_assignments
person_region_assignments
regional_leadership_assignments
```

The location table should remain the source for colleges, schools, counties, and future geographic units.

Regions should aggregate locations rather than replace them.

---

# 30. Data Ownership

The Arkansas Youth Coalition is the organizational steward of data entered into the Workbench.

Operationally:

- Leaders may manage records within their authority.
- Individuals should eventually be able to review or correct their own basic information.
- Sensitive data access should be limited.
- Exports should be controlled.
- No team should create an independent shadow database when the central Workbench can support the need.

The system should promote shared organizational continuity without treating people as property.

---

# 31. Data Quality Standards

Required standards:

- Names use readable capitalization.
- Emails are normalized.
- Phone numbers are normalized.
- Locations use canonical location records.
- Teams use canonical team records.
- Positions use approved values.
- Statuses use approved values.
- Duplicate warnings are reviewed.
- Required fields are enforced.
- Archived records are excluded from active defaults.
- Timestamps are recorded consistently.

## 31.1 Unknown values

The system should distinguish between:

```text
UNKNOWN
NOT_APPLICABLE
NOT_PROVIDED
```

These meanings should not be collapsed into misleading empty strings when the distinction matters.

## 31.2 Free-text prevention

Fields that represent a controlled concept should use an enum or foreign key.

Do not use free text for:

- Team
- Position
- Status
- Location type
- Feedback category
- Contact type

---

# 32. Date and Time Standards

Store timestamps in UTC.

Examples:

```text
created_at
updated_at
archived_at
started_at
ended_at
```

Convert to the user’s local time for display.

Date-only fields should use a date type when time is irrelevant.

The database should not store ambiguous local timestamp strings.

---

# 33. Soft Deletion and Archiving

Major operational tables should support archiving where appropriate.

Recommended fields:

```text
archived_at
archived_by_actor
archive_reason
```

An `active` boolean may be used for simple reference tables, but lifecycle-rich entities should use explicit statuses.

Archived records should remain queryable by authorized administrators.

---

# 34. Database Constraints

The database must enforce core integrity, not rely entirely on frontend behavior.

Examples:

- Required names cannot be null.
- Location composite codes must be unique.
- Team slugs must be unique.
- Contact-method normalized values should be indexed.
- Foreign keys must reference valid records.
- Team assignments require a person and team.
- Location affiliations require a person and location.
- Only supported enum values are accepted.
- Primary assignments should be constrained where practical.
- Date ranges should not end before they begin.

---

# 35. Indexing Strategy

Phase 1 indexes should support:

- Person name search
- Email duplicate detection
- Phone duplicate detection
- Location code lookup
- Location normalized-name lookup
- Team filtering
- Status filtering
- Active-directory queries
- Audit lookups by entity
- Feedback status review

Suggested indexes:

```text
people(last_name, first_name)
people(status)
person_contact_methods(normalized_value)
locations(composite_code)
locations(location_type, code)
locations(normalized_name)
person_team_assignments(team_id, status)
person_location_affiliations(location_id, status)
audit_events(entity_type, entity_id)
beta_feedback(status, created_at)
```

Search requirements may later justify PostgreSQL full-text or trigram indexes.

Phase 1 should not add external search infrastructure.

---

# 36. Migration Standards

Every schema change must use a migration.

Migration files should be:

- Numbered or timestamped
- Immutable after production use
- Reviewed
- Tested against an empty database
- Tested against an existing development database
- Documented when behavior changes

Example naming:

```text
001_initial_people_and_locations.sql
002_add_person_contact_methods.sql
003_add_team_assignments.sql
004_add_beta_feedback.sql
```

## 36.1 Destructive migrations

Destructive changes require:

- Explicit approval
- Backup confirmation
- Data migration plan
- Rollback or recovery plan
- Verification query
- Deployment sequencing

A normal frontend feature slice must not casually drop columns or tables.

---

# 37. Seed Data

Phase 1 seed data should include canonical team records.

Example:

```text
Organizer
Voter Registration
Social Media
Events
Outreach
```

The system may include a few clearly marked development-only sample locations and people.

Production must not receive fake contacts unless explicitly labeled as demonstration records.

Seed scripts should be idempotent where practical.

---

# 38. Development and Production Separation

Development, preview, and production environments must use separate databases or safely isolated schemas.

Development data must not contain unnecessary copies of production contact information.

Deploy previews should not automatically expose or mutate the production contact database.

Environment labels should be visible to operators when there is a risk of entering data into the wrong environment.

---

# 39. Import Architecture

Bulk import is deferred, but future imports should use a staging process.

Recommended future stages:

```text
uploaded
parsed
validated
duplicate-reviewed
approved
committed
failed
```

Potential tables:

```text
import_batches
import_rows
import_row_errors
import_match_candidates
```

Imports should never write unreviewed rows directly into canonical people tables.

---

# 40. Export Architecture

Future authorized exports should support:

- Active directory
- Team roster
- Location roster
- Leadership roster
- Contact backup
- Audit review
- Beta feedback

Exports containing personal information should:

- Require appropriate permission
- Record an audit event
- Limit unnecessary fields
- Avoid public URLs
- Include an expiration policy when generated as downloadable files

---

# 41. Data Retention

AYC should establish a formal retention policy before the system holds large volumes of youth and volunteer data.

Initial principles:

- Active contacts remain while operationally useful.
- Inactive contacts are retained for continuity and duplicate prevention.
- Archived records are periodically reviewed.
- Communication opt-outs are retained as necessary to honor them.
- Audit records are retained longer than ordinary interface history.
- Test data is removed regularly.
- Sensitive notes should not be retained indefinitely without purpose.

Retention periods should be approved through legal and organizational review rather than invented in code.

---

# 42. Data Correction

Future users should have a clear pathway to correct inaccurate personal information.

Correction workflow may include:

```text
requested
reviewing
approved
completed
declined
```

Routine corrections such as email or phone updates should eventually be simple.

Disputed historical or audit records should not be silently rewritten.

---

# 43. Data Breach and Incident Readiness

Before production use expands, the project should maintain procedures for:

- Detecting unauthorized access
- Rotating credentials
- Disabling write access
- Reviewing audit logs
- Identifying affected records
- Preserving evidence
- Communicating with organizational leadership
- Following applicable notification obligations

The schema should support investigation without logging unnecessary sensitive values.

---

# 44. Phase 1 Logical Schema

The recommended Phase 1 logical model is:

```text
people
person_contact_methods
locations
person_location_affiliations
teams
person_team_assignments
beta_feedback
audit_events
```

An implementation may combine selected low-complexity fields for the first release, but it must preserve a documented path toward this canonical structure.

The strongest recommendation is to implement the relational structure from the beginning because the number of tables remains small and avoids later migration pain.

---

# 45. Phase 1 Physical Schema Draft

## `people`

```text
id UUID PRIMARY KEY
first_name TEXT NOT NULL
middle_name TEXT NULL
last_name TEXT NOT NULL
preferred_name TEXT NULL
display_name TEXT NULL
status PERSON_STATUS NOT NULL DEFAULT 'ACTIVE'
source PERSON_SOURCE NOT NULL DEFAULT 'LEADER_ENTRY'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
archived_at TIMESTAMPTZ NULL
created_by_actor TEXT NOT NULL
updated_by_actor TEXT NOT NULL
```

## `person_contact_methods`

```text
id UUID PRIMARY KEY
person_id UUID NOT NULL REFERENCES people(id)
contact_type CONTACT_TYPE NOT NULL
contact_value TEXT NOT NULL
normalized_value TEXT NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT FALSE
is_verified BOOLEAN NOT NULL DEFAULT FALSE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
archived_at TIMESTAMPTZ NULL
```

## `locations`

```text
id UUID PRIMARY KEY
location_type LOCATION_TYPE NOT NULL
code CHAR(3) NOT NULL
composite_code TEXT NOT NULL UNIQUE
name TEXT NOT NULL
normalized_name TEXT NOT NULL
short_name TEXT NULL
city TEXT NULL
county_name TEXT NULL
state CHAR(2) NOT NULL DEFAULT 'AR'
active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
archived_at TIMESTAMPTZ NULL
created_by_actor TEXT NOT NULL
updated_by_actor TEXT NOT NULL
```

## `person_location_affiliations`

```text
id UUID PRIMARY KEY
person_id UUID NOT NULL REFERENCES people(id)
location_id UUID NOT NULL REFERENCES locations(id)
affiliation_type AFFILIATION_TYPE NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT FALSE
status ASSIGNMENT_STATUS NOT NULL DEFAULT 'ACTIVE'
started_at DATE NULL
ended_at DATE NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

## `teams`

```text
id UUID PRIMARY KEY
name TEXT NOT NULL
slug TEXT NOT NULL UNIQUE
code CHAR(3) NULL UNIQUE
description TEXT NULL
active BOOLEAN NOT NULL DEFAULT TRUE
display_order INTEGER NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
archived_at TIMESTAMPTZ NULL
```

## `person_team_assignments`

```text
id UUID PRIMARY KEY
person_id UUID NOT NULL REFERENCES people(id)
team_id UUID NOT NULL REFERENCES teams(id)
position TEAM_POSITION NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT FALSE
status ASSIGNMENT_STATUS NOT NULL DEFAULT 'ACTIVE'
started_at DATE NULL
ended_at DATE NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
assigned_by_actor TEXT NOT NULL
```

## `beta_feedback`

```text
id UUID PRIMARY KEY
reference_code TEXT NOT NULL UNIQUE
category FEEDBACK_CATEGORY NOT NULL
page_path TEXT NULL
workflow TEXT NULL
description TEXT NOT NULL
severity FEEDBACK_SEVERITY NULL
status FEEDBACK_STATUS NOT NULL DEFAULT 'NEW'
reporter_person_id UUID NULL REFERENCES people(id)
reporter_name TEXT NULL
reporter_contact TEXT NULL
browser_context JSONB NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
resolved_at TIMESTAMPTZ NULL
resolution_summary TEXT NULL
```

## `audit_events`

```text
id UUID PRIMARY KEY
event_type TEXT NOT NULL
entity_type TEXT NOT NULL
entity_id UUID NULL
actor_type TEXT NOT NULL
actor_id UUID NULL
actor_label TEXT NULL
change_summary TEXT NOT NULL
metadata JSONB NULL
request_id TEXT NULL
created_at TIMESTAMPTZ NOT NULL
```

---

# 46. Required Phase 1 Enums

```text
PERSON_STATUS
ACTIVE
PROSPECTIVE
INACTIVE
ARCHIVED
```

```text
PERSON_SOURCE
LEADER_ENTRY
BETA_IMPORT
MANUAL_ADMIN
```

```text
CONTACT_TYPE
EMAIL
MOBILE_PHONE
```

```text
LOCATION_TYPE
COLLEGE
HIGH_SCHOOL
COUNTY
```

```text
AFFILIATION_TYPE
CURRENT_COLLEGE
CURRENT_SCHOOL
NON_STUDENT_COUNTY
COUNTY_RESIDENCE
ORGANIZING_LOCATION
```

```text
TEAM_POSITION
LEAD
VOLUNTEER
```

```text
ASSIGNMENT_STATUS
ACTIVE
PENDING
INACTIVE
ENDED
```

```text
FEEDBACK_CATEGORY
CONFUSING
MISSING_FEATURE
MOBILE_PROBLEM
ERROR
IDEA
PRIVACY_CONCERN
ACCESSIBILITY_PROBLEM
```

```text
FEEDBACK_SEVERITY
LOW
MEDIUM
HIGH
BLOCKING
```

```text
FEEDBACK_STATUS
NEW
REVIEWING
PLANNED
IN_PROGRESS
RESOLVED
DECLINED
DUPLICATE
```

---

# 47. Derived Directory View

The application may use a database view or repository query that produces a simplified directory record.

Suggested output:

```text
person_id
display_name
first_name
last_name
status
primary_email
primary_phone
preferred_contact_method
primary_location_id
primary_location_name
primary_location_code
primary_location_type
primary_team_id
primary_team_name
primary_position
additional_team_count
created_at
updated_at
```

This view should exclude:

- Archived records by default
- Private notes
- Audit metadata
- Internal authorization data
- Communication-consent details
- Account-security fields

---

# 48. Summary Metrics

The Phase 1 directory summary may calculate:

```text
total_active_people
total_leads
total_volunteers
total_locations
total_colleges
total_high_schools
total_counties
total_teams
people_by_team
people_by_location_type
```

Metric definitions must be documented.

For example:

> Total Locations means active locations with at least one active person affiliation.

It should not silently count unused registry records unless the interface clearly labels that meaning.

---

# 49. Data API Contracts

Server responses should return stable application contracts rather than exposing raw database rows.

Example person-directory contract:

```json
{
  "id": "uuid",
  "name": {
    "first": "Jordan",
    "last": "Smith",
    "preferred": "Jordan",
    "display": "Jordan Smith"
  },
  "status": "ACTIVE",
  "primaryLocation": {
    "id": "uuid",
    "type": "COLLEGE",
    "code": "UCA",
    "compositeCode": "COL-UCA",
    "name": "University of Central Arkansas"
  },
  "primaryTeam": {
    "id": "uuid",
    "slug": "organizer",
    "name": "Organizer",
    "position": "VOLUNTEER"
  },
  "additionalTeams": [],
  "contact": {
    "email": "masked or authorized value",
    "phone": "masked or authorized value",
    "preferredMethod": "TEXT"
  }
}
```

Internal database changes should not unnecessarily break frontend contracts.

---

# 50. Privacy by Query Design

Data protection should be enforced through separate queries and response models.

Examples:

## Directory summary query

Returns:

- Name
- Location
- Team
- Position
- Status

## Authorized contact-detail query

May additionally return:

- Email
- Phone
- Preferred contact method

## Restricted administrative query

May return:

- Audit history
- Archived information
- Internal status details

The frontend should not receive every field and then merely hide sensitive values with CSS.

---

# 51. Data Validation Rules

## Person

- First and last name required.
- Names trimmed.
- Unreasonable field lengths rejected.
- Status must be approved enum.

## Email

- Trimmed.
- Lowercased for normalization.
- Basic format validation.
- Maximum length enforced.

## Phone

- Normalized to digits.
- Plausible length validated.
- Display formatting handled separately.

## Location code

- Exactly three uppercase letters.
- Unique within type.
- Composite code globally unique.

## Team assignment

- Person and team must exist.
- One primary active team per person.
- Duplicate active assignment to same team prevented.

## Location affiliation

- Person and location must exist.
- One primary active location per person.
- Duplicate active affiliation prevented when equivalent.

## Feedback

- Description required.
- Maximum length enforced.
- Category required.
- Reporter contact optional.

---

# 52. Data Governance Decisions Requiring Future Approval

The following questions should remain open until the leadership team’s beta use provides evidence:

- Should every person have only one primary location?
- Should county residence be collected separately from school?
- Should leaders see full contact details by default?
- Should team leads edit only their own rosters?
- Should volunteers be able to update their own information?
- Should prospective contacts appear in the regular directory?
- How long should inactive records be retained?
- Which communications require explicit consent records?
- What information about minors may be collected?
- Should leadership positions exist at both team and location levels?
- What export authority should team leads receive?

These must be resolved in later product and governance volumes rather than assumed in code.

---

# 53. Phase 1 Data Boundaries

Phase 1 is authorized to store:

- Name
- Email
- Mobile phone
- Preferred contact method
- College, high school, or county affiliation
- Team assignment
- Lead or volunteer position
- Participation status
- Basic audit information
- Beta feedback

Phase 1 is not authorized to store:

- Street address
- Birth date
- Government identification
- Social Security number
- Student records
- Grades
- Medical information
- Detailed political profiling
- Family information
- Financial information
- Sensitive personal narratives
- Private messaging history
- Background-check information
- Voter-file data
- Bulk communication consent inferred from contact entry

---

# 54. Phase 1 Data Completion Standard

The data foundation is ready for beta when:

- Canonical people records exist.
- Contact methods are normalized.
- Locations use namespaces and three-letter codes.
- Teams are canonical records.
- People may belong to multiple teams.
- One primary team is supported.
- One primary location is supported.
- Lead and volunteer positions are supported.
- Active, prospective, inactive, and archived statuses are supported.
- Duplicate email and phone detection works.
- Name-and-location duplicate warnings work.
- Archived records remain searchable for duplicate review.
- Contact creation is transactional.
- Database constraints enforce core integrity.
- Audit events are written for material changes.
- Beta feedback persists.
- Sensitive fields are excluded from general directory queries.
- Schema migrations are documented and validated.
- Production secrets and personal exports are absent from the repository.
- Deferred future data has not been added without approval.

---

# 55. Governing Data Principle

Every future AYC feature must strengthen the same shared organizational memory.

The system should know:

- Who a person is
- How AYC may contact them
- Where they are connected
- How they participate
- How their role changes over time
- What organizational history must be preserved

It should not scatter that truth across separate spreadsheets, isolated team databases, or disconnected applications.

The Arkansas Youth Coalition Workbench will grow successfully only if its data remains clear, respectful, trustworthy, and shared.

---

**Next:** Volume V — Product Architecture (users, boards, permissions, workflows, route hierarchy, leader actions, display behavior, beta sequence, statewide leader board vs future team admin boards).
