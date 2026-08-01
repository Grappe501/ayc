-- Upgrade #8: Team Board tasks-light.

CREATE TABLE IF NOT EXISTS team_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams (id),
  title text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'DONE', 'CANCELLED')),
  priority text NOT NULL DEFAULT 'NORMAL'
    CHECK (priority IN ('NORMAL', 'HIGH')),
  due_on date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  archived_at timestamptz,
  created_by_actor text,
  updated_by_actor text
);

CREATE INDEX IF NOT EXISTS team_tasks_team_status_idx
  ON team_tasks (team_id, status, sort_order, created_at DESC);

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
      'BETA_FEEDBACK_SUBMITTED'
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
      'BETA_FEEDBACK',
      'TEAM'
    )
  );
