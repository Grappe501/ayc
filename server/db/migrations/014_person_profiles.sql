-- Directory profiles: narrative, photo path, public/private notes.

CREATE TABLE IF NOT EXISTS person_profiles (
  person_id uuid PRIMARY KEY REFERENCES people (id) ON DELETE CASCADE,
  photo_path text,
  hometown text,
  major text,
  interests text,
  narrative text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS person_profile_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  author_person_id uuid REFERENCES people (id),
  author_display_name text NOT NULL,
  body text NOT NULL,
  visibility text NOT NULL DEFAULT 'PUBLIC'
    CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS person_profile_notes_person_idx
  ON person_profile_notes (person_id, created_at DESC);
CREATE INDEX IF NOT EXISTS person_profile_notes_visibility_idx
  ON person_profile_notes (person_id, visibility)
  WHERE archived_at IS NULL;

ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS audit_events_event_type_check;
ALTER TABLE audit_events ADD CONSTRAINT audit_events_event_type_check
  CHECK (
    event_type IN (
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
      'PROFILE_UPDATED',
      'PROFILE_PHOTO_UPDATED',
      'PROFILE_NOTE_CREATED',
      'PROFILE_NOTE_ARCHIVED'
    )
  );

ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS audit_events_entity_type_check;
ALTER TABLE audit_events ADD CONSTRAINT audit_events_entity_type_check
  CHECK (
    entity_type IN (
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
      'PERSON_PROFILE_NOTE'
    )
  );
