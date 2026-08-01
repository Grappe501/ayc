# BUILD RETURN — Phase 2 CAL Nested Calendars

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2-CAL-0…5-NESTED-CALENDARS`

## Done

- CAL-0: `calendars` + `calendar_events` (`010_calendars.sql`); seed one calendar per board; auto-create on new location boards
- CAL-1: `GET|POST|PATCH /api/leader-calendar-events` with scope checks via `canAccessBoard` law
- CAL-2/5: `/leader/calendar` month + list, create/cancel, board selector, belongs-to badge
- CAL-3/4: Rollup query rules for Main, statewide category, segment, location TEAM (no duplicated rows)

## Boundaries

- No RSVP, recurrence, ICS, or public calendars
- Reports density hooks deferred
