-- Phase 2E: Location TEAM + location category board uniqueness.

CREATE UNIQUE INDEX IF NOT EXISTS boards_location_team_uidx
  ON boards (location_id)
  WHERE kind = 'LOCATION_TEAM' AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS boards_location_category_uidx
  ON boards (location_id, team_id)
  WHERE kind = 'LOCATION_CATEGORY' AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS boards_location_idx
  ON boards (location_id)
  WHERE location_id IS NOT NULL AND archived_at IS NULL;
