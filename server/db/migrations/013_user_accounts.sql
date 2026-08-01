-- Personal accounts: invite/claim only; linked to people (Volume IV).

CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL UNIQUE REFERENCES people (id),
  auth_subject text NOT NULL UNIQUE,
  email text NOT NULL,
  account_status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (account_status IN ('ACTIVE', 'DISABLED')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);

CREATE INDEX IF NOT EXISTS user_accounts_email_idx ON user_accounts (email);
CREATE INDEX IF NOT EXISTS user_accounts_status_idx ON user_accounts (account_status);

CREATE TABLE IF NOT EXISTS account_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id),
  email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  invited_by_actor text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_invites_person_idx ON account_invites (person_id);
CREATE INDEX IF NOT EXISTS account_invites_email_idx ON account_invites (email);

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
      'ACCOUNT_DISABLED'
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
      'ACCOUNT_INVITE'
    )
  );
