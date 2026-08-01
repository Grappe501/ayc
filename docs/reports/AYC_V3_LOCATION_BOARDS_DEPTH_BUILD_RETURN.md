# BUILD RETURN — Location board depth (#3)

**Date:** 2026-08-01  
**Slice:** V3 location boards — TEAM mission + category Tasks/Resources

## Done

1. **Location TEAM Mission** (already on `main` as `e53b7f6`) — HS / college / county charges on `/leader/locations/:id`
2. **Location category Tasks + Resources** — location-scoped via nullable `location_id`
   - Migration `015_location_scoped_tasks_resources.sql`
   - Statewide boards: `location_id IS NULL` only
   - Location boards: `team + location_id` only (no pollution either way)
   - Mounted on `/leader/locations/:id/teams/:teamSlug` after calendar

## Apply migration

**Applied** on production Supabase (`yprxjkyjbfhinsassdaw`) 2026-08-01 via MCP `apply_migration` (`location_scoped_tasks_resources`). Verified `team_tasks.location_id` and `team_resources.location_id` exist (nullable uuid).

## Boundaries

- No Location TEAM tasks/resources (TEAM stays mission + roster + calendar + hub)
- No Notify Chance (still skipped)
- Canonical mission unchanged
