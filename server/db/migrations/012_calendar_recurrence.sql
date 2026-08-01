-- Calendar recurrence: rule on master event; exceptions cancel single occurrences.

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS recurrence_frequency text
    CHECK (
      recurrence_frequency IS NULL
      OR recurrence_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')
    ),
  ADD COLUMN IF NOT EXISTS recurrence_interval integer NOT NULL DEFAULT 1
    CHECK (recurrence_interval >= 1 AND recurrence_interval <= 30),
  ADD COLUMN IF NOT EXISTS recurrence_by_weekday integer[],
  ADD COLUMN IF NOT EXISTS recurrence_until timestamptz,
  ADD COLUMN IF NOT EXISTS recurrence_count integer
    CHECK (recurrence_count IS NULL OR (recurrence_count >= 1 AND recurrence_count <= 365));

CREATE TABLE IF NOT EXISTS calendar_event_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES calendar_events (id) ON DELETE CASCADE,
  occurrence_starts_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'CANCELLED'
    CHECK (status IN ('CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, occurrence_starts_at)
);

CREATE INDEX IF NOT EXISTS calendar_event_exceptions_event_idx
  ON calendar_event_exceptions (event_id);

CREATE INDEX IF NOT EXISTS calendar_events_recurrence_idx
  ON calendar_events (recurrence_frequency)
  WHERE recurrence_frequency IS NOT NULL AND status = 'SCHEDULED';

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
      'CALENDAR_OCCURRENCE_CANCELLED'
    )
  );
