-- AYC Phase 1C data foundation
-- Canonical tables per Volume IV. Soft-delete via archived_at; no hard deletes in Phase 1.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- Enums as CHECK constraints for portability across managed Postgres.

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_type text NOT NULL
    CHECK (location_type IN ('COLLEGE', 'HIGH_SCHOOL', 'COUNTY')),
  code text NOT NULL
    CHECK (code ~ '^[A-Z]{3}$'),
  composite_code text NOT NULL UNIQUE
    CHECK (composite_code ~ '^(COL|HSC|CTY)-[A-Z]{3}$'),
  name text NOT NULL,
  normalized_name text NOT NULL,
  short_name text,
  city text,
  county_name text,
  state text NOT NULL DEFAULT 'AR',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by_actor text,
  updated_by_actor text,
  UNIQUE (location_type, code)
);

CREATE INDEX IF NOT EXISTS locations_normalized_name_idx
  ON locations (normalized_name);

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  preferred_name text,
  display_name text,
  status text NOT NULL
    CHECK (status IN ('ACTIVE', 'PROSPECTIVE', 'INACTIVE', 'ARCHIVED')),
  source text NOT NULL
    CHECK (source IN ('LEADER_ENTRY', 'BETA_IMPORT', 'MANUAL_ADMIN')),
  preferred_contact_method text
    CHECK (
      preferred_contact_method IS NULL
      OR preferred_contact_method IN ('TEXT', 'EMAIL', 'EITHER', 'UNKNOWN')
    ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by_actor text,
  updated_by_actor text
);

CREATE INDEX IF NOT EXISTS people_name_idx
  ON people (lower(last_name), lower(first_name));

CREATE INDEX IF NOT EXISTS people_status_idx
  ON people (status);

CREATE TABLE IF NOT EXISTS person_contact_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id) ON DELETE RESTRICT,
  contact_type text NOT NULL
    CHECK (contact_type IN ('EMAIL', 'MOBILE_PHONE')),
  contact_value text NOT NULL,
  normalized_value text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  consent_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (consent_status IN ('UNKNOWN', 'GRANTED', 'DENIED', 'NOT_APPLICABLE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS person_contact_methods_primary_type_uidx
  ON person_contact_methods (person_id, contact_type)
  WHERE is_primary = true AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS person_contact_methods_normalized_uidx
  ON person_contact_methods (contact_type, normalized_value)
  WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS person_location_affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id) ON DELETE RESTRICT,
  location_id uuid NOT NULL REFERENCES locations (id) ON DELETE RESTRICT,
  affiliation_type text NOT NULL
    CHECK (
      affiliation_type IN (
        'CURRENT_SCHOOL',
        'CURRENT_COLLEGE',
        'COUNTY_RESIDENCE',
        'NON_STUDENT_COUNTY',
        'ORGANIZING_LOCATION'
      )
    ),
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'ENDED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS person_location_affiliations_primary_uidx
  ON person_location_affiliations (person_id)
  WHERE is_primary = true AND status = 'ACTIVE' AND ended_at IS NULL;

CREATE INDEX IF NOT EXISTS person_location_affiliations_person_idx
  ON person_location_affiliations (person_id);

CREATE TABLE IF NOT EXISTS person_team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id) ON DELETE RESTRICT,
  team_id uuid NOT NULL REFERENCES teams (id) ON DELETE RESTRICT,
  position text NOT NULL
    CHECK (position IN ('LEAD', 'VOLUNTEER')),
  is_primary boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'PENDING', 'INACTIVE', 'ENDED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  assigned_by_actor text
);

CREATE UNIQUE INDEX IF NOT EXISTS person_team_assignments_primary_uidx
  ON person_team_assignments (person_id)
  WHERE is_primary = true AND status = 'ACTIVE' AND ended_at IS NULL;

CREATE INDEX IF NOT EXISTS person_team_assignments_person_idx
  ON person_team_assignments (person_id);

CREATE TABLE IF NOT EXISTS beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  category text NOT NULL
    CHECK (
      category IN (
        'CONFUSING',
        'MISSING_FEATURE',
        'MOBILE_PROBLEM',
        'ERROR',
        'IDEA',
        'PRIVACY_CONCERN',
        'ACCESSIBILITY_PROBLEM'
      )
    ),
  page_path text,
  workflow text,
  description text NOT NULL,
  severity text
    CHECK (
      severity IS NULL
      OR severity IN ('LOW', 'MEDIUM', 'HIGH', 'BLOCKING')
    ),
  status text NOT NULL DEFAULT 'NEW'
    CHECK (
      status IN (
        'NEW',
        'REVIEWING',
        'PLANNED',
        'IN_PROGRESS',
        'RESOLVED',
        'DECLINED',
        'DUPLICATE'
      )
    ),
  reporter_person_id uuid REFERENCES people (id) ON DELETE SET NULL,
  reporter_name text,
  reporter_contact text,
  browser_context text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolution_summary text
);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL
    CHECK (
      event_type IN (
        'PERSON_CREATED',
        'PERSON_UPDATED',
        'PERSON_STATUS_CHANGED',
        'PERSON_ARCHIVED',
        'PERSON_RESTORED',
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
    ),
  entity_type text NOT NULL
    CHECK (
      entity_type IN (
        'PERSON',
        'CONTACT_METHOD',
        'LOCATION',
        'TEAM_ASSIGNMENT',
        'BETA_FEEDBACK',
        'TEAM'
      )
    ),
  entity_id uuid NOT NULL,
  actor_type text NOT NULL
    CHECK (actor_type IN ('SYSTEM', 'SHARED_LEADER_SESSION', 'USER', 'ADMIN', 'IMPORT')),
  actor_id text,
  actor_label text,
  change_summary text NOT NULL,
  metadata jsonb,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_entity_idx
  ON audit_events (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_events_created_at_idx
  ON audit_events (created_at DESC);
