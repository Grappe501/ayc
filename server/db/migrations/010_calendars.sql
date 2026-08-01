-- Phase 2-CAL: Nested calendars (one calendar per board; events written once, rollup by query).

CREATE TABLE IF NOT EXISTS calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL UNIQUE REFERENCES boards (id),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'BOARD'
    CHECK (kind IN ('BOARD')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendars_board_idx ON calendars (board_id);

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_calendar_id uuid NOT NULL REFERENCES calendars (id),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  location_text text,
  url text,
  visibility text NOT NULL DEFAULT 'INTERNAL'
    CHECK (visibility IN ('INTERNAL', 'PUBLIC')),
  status text NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED', 'CANCELLED')),
  created_by_person_id uuid REFERENCES people (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS calendar_events_source_starts_idx
  ON calendar_events (source_calendar_id, starts_at);

CREATE INDEX IF NOT EXISTS calendar_events_starts_idx
  ON calendar_events (starts_at)
  WHERE status = 'SCHEDULED';

-- One calendar per existing board.
INSERT INTO calendars (board_id, name, kind)
SELECT b.id, b.name || ' Calendar', 'BOARD'
FROM boards b
WHERE b.archived_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM calendars c WHERE c.board_id = b.id);

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
      'CALENDAR_EVENT_CANCELLED'
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
      'CALENDAR_EVENT'
    )
  );
