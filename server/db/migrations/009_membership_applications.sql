-- Phase 2B: Membership applications queue (person created on Accept).

CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'NEW'
    CHECK (
      status IN ('NEW', 'REVIEWING', 'ACCEPTED', 'DECLINED', 'DUPLICATE')
    ),
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text,
  email text NOT NULL,
  email_normalized text NOT NULL,
  phone text,
  phone_normalized text,
  city text,
  county text,
  age_confirmed boolean NOT NULL DEFAULT false,
  location_interest_type text NOT NULL DEFAULT 'UNSURE'
    CHECK (
      location_interest_type IN ('COLLEGE', 'HIGH_SCHOOL', 'WORKING_CLASS', 'UNSURE')
    ),
  location_name_freeform text,
  location_id uuid REFERENCES locations (id),
  primary_team_interest text NOT NULL,
  secondary_interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  wants_to_lead_local boolean NOT NULL DEFAULT false,
  wants_category_lead boolean NOT NULL DEFAULT false,
  experience_notes text,
  availability_notes text,
  how_heard text,
  review_notes text,
  matched_person_id uuid REFERENCES people (id),
  assigned_to_person_id uuid REFERENCES people (id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_applications_status_idx
  ON membership_applications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS membership_applications_email_idx
  ON membership_applications (email_normalized);

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
      'APPLICATION_DECLINED'
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
      'MEMBERSHIP_APPLICATION'
    )
  );
