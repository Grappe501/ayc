-- Location-scoped tasks & resources (nullable location_id).
-- NULL location_id = statewide category board; set = location category board.

ALTER TABLE team_tasks
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations (id);

ALTER TABLE team_resources
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations (id);

CREATE INDEX IF NOT EXISTS team_tasks_team_location_status_idx
  ON team_tasks (team_id, location_id, status, sort_order)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS team_resources_team_location_idx
  ON team_resources (team_id, location_id, archived_at, sort_order);
