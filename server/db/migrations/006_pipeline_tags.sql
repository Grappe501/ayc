-- Upgrade #10: Leadership pipeline tags.

CREATE TABLE IF NOT EXISTS person_pipeline_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id),
  tag text NOT NULL
    CHECK (
      tag IN (
        'FUTURE_LEADER',
        'NEEDS_MENTORING',
        'READY_TO_LEAD',
        'LOCAL_LEAD_CANDIDATE',
        'CATEGORY_LEAD_CANDIDATE'
      )
    ),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by_actor text,
  updated_by_actor text
);

CREATE UNIQUE INDEX IF NOT EXISTS person_pipeline_tags_active_uidx
  ON person_pipeline_tags (person_id, tag)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS person_pipeline_tags_tag_idx
  ON person_pipeline_tags (tag)
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
      'TEAM_RESOURCE',
      'PIPELINE_TAG',
      'BETA_FEEDBACK',
      'TEAM'
    )
  );
