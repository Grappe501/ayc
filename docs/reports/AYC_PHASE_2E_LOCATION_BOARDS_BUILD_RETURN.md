# BUILD RETURN — Phase 2E Location Boards

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2E-LOCATION-BOARDS`

## Done

- Migration `008_location_boards.sql` — unique indexes for LOCATION_TEAM / LOCATION_CATEGORY
- `ensureLocationBoards` on location create + fetch-by-id; `npm run db:seed-location-boards` backfill
- Routes: `/leader/locations/:locationId`, `/leader/locations/:locationId/teams/:teamSlug`
- Roster filter `locationId`; locations API `?id=`
- Access: master + category (not GD) on TEAM; category match on location category; HS/WC segment on matching TEAM only
- Segment boards link into location TEAM boards
- Validate + unit tests

## Boundaries

- No location Graphic Design boards (statewide GD pool)
- No calendars / mission-tasks-resources modules on location boards (MVP roster)
- Full segment workspaces → 2F; person-linked RBAC → 2G
