-- Phase 2A: Leadership hierarchy foundation — roles, board registry, Graphic Design team.

INSERT INTO teams (name, slug, code, description, active, display_order)
SELECT
  'Graphic Design',
  'graphic-design',
  'GRD',
  'Create clear visuals and design assets for the coalition. Statewide designers sit here under Social Media.',
  true,
  6
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE slug = 'graphic-design');

CREATE TABLE IF NOT EXISTS leadership_roles (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO leadership_roles (code, label, description, display_order) VALUES
  ('LEAD_ORGANIZER', 'Lead Organizer', 'System administrator — full access across AYC.', 1),
  ('CATEGORY_LEAD', 'Category Campaign Lead', 'Owns one statewide category and its location boards.', 2),
  ('GRAPHIC_DESIGN_LEAD', 'Graphic Design Lead', 'Owns the Graphic Design secondary board under Social Media.', 3),
  ('HS_LEAD_ORGANIZER', 'High School Lead Organizer', 'Develops lead organizers across high school locations.', 4),
  ('WC_LEAD_ORGANIZER', 'Working Class Lead Organizer', 'Develops lead organizers across county / working-class locations.', 5),
  ('LOCATION_LEAD', 'Location Lead Organizer', 'Runs one location TEAM board (future).', 6),
  ('LOCATION_TEAM_LEAD', 'Location Category Lead', 'Leads one category team at one location (future).', 7),
  ('VOLUNTEER', 'Volunteer', 'Contributes on assigned teams without lead scope.', 8)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

CREATE TABLE IF NOT EXISTS person_leadership_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people (id),
  role_code text NOT NULL REFERENCES leadership_roles (code),
  team_id uuid REFERENCES teams (id),
  location_id uuid REFERENCES locations (id),
  segment text
    CHECK (
      segment IS NULL
      OR segment IN ('HIGH_SCHOOL', 'WORKING_CLASS', 'COLLEGE', 'ALL')
    ),
  is_primary boolean NOT NULL DEFAULT false,
  granted_by_actor text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS person_leadership_roles_person_idx
  ON person_leadership_roles (person_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS person_leadership_roles_role_idx
  ON person_leadership_roles (role_code)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL
    CHECK (
      kind IN (
        'MAIN',
        'STATEWIDE_CATEGORY',
        'SECONDARY',
        'SEGMENT',
        'LOCATION_TEAM',
        'LOCATION_CATEGORY'
      )
    ),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_board_id uuid REFERENCES boards (id),
  team_id uuid REFERENCES teams (id),
  location_id uuid REFERENCES locations (id),
  segment text
    CHECK (
      segment IS NULL
      OR segment IN ('HIGH_SCHOOL', 'WORKING_CLASS', 'COLLEGE', 'ALL')
    ),
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS boards_kind_idx ON boards (kind) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS boards_parent_idx ON boards (parent_board_id) WHERE archived_at IS NULL;

INSERT INTO boards (kind, slug, name, display_order)
SELECT 'MAIN', 'main', 'Lead Organizer Board', 0
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE slug = 'main');

INSERT INTO boards (kind, slug, name, team_id, display_order)
SELECT
  'STATEWIDE_CATEGORY',
  t.slug,
  t.name || ' Lead Board',
  t.id,
  t.display_order
FROM teams t
WHERE t.slug IN (
  'organizer',
  'voter-registration',
  'social-media',
  'events',
  'outreach'
)
AND NOT EXISTS (SELECT 1 FROM boards b WHERE b.slug = t.slug);

INSERT INTO boards (kind, slug, name, parent_board_id, team_id, display_order)
SELECT
  'SECONDARY',
  'graphic-design',
  'Graphic Design Lead Board',
  parent.id,
  t.id,
  35
FROM teams t
INNER JOIN boards parent ON parent.slug = 'social-media'
WHERE t.slug = 'graphic-design'
AND NOT EXISTS (SELECT 1 FROM boards b WHERE b.slug = 'graphic-design');

INSERT INTO boards (kind, slug, name, segment, display_order)
SELECT 'SEGMENT', 'high-school', 'High School Lead Organizer Board', 'HIGH_SCHOOL', 90
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE slug = 'high-school');

INSERT INTO boards (kind, slug, name, segment, display_order)
SELECT 'SEGMENT', 'working-class', 'Working Class Lead Organizer Board', 'WORKING_CLASS', 91
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE slug = 'working-class');

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
      'LEADERSHIP_ROLE',
      'BOARD',
      'BETA_FEEDBACK',
      'TEAM'
    )
  );
