-- Upgrade #4: person merge history + PERSON_MERGED audit event.

CREATE TABLE IF NOT EXISTS person_merge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surviving_person_id uuid NOT NULL REFERENCES people (id),
  merged_person_id uuid NOT NULL REFERENCES people (id),
  merged_at timestamptz NOT NULL DEFAULT now(),
  merged_by_actor text,
  reason text,
  summary text,
  UNIQUE (merged_person_id)
);

CREATE INDEX IF NOT EXISTS person_merge_history_surviving_idx
  ON person_merge_history (surviving_person_id, merged_at DESC);

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
      'BETA_FEEDBACK_SUBMITTED'
    )
  );
