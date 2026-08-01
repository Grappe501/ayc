# BUILD RETURN — Phase 2 CAL Public Calendar

**Date:** 2026-08-01  
**Slice:** `AYC-PHASE-2-CAL-PUBLIC`

## Done

- Public page `/calendar` lists expanded occurrences of `visibility=PUBLIC` + `SCHEDULED` events only
- `GET /api/public-calendar-events` — unauthenticated, rate-limited
- `GET /api/public-calendar-ics` — unauthenticated ICS (RRULE + EXDATE) for the same public set
- Leader create/edit: visibility toggle (default `INTERNAL`); list shows Public/Internal + Make public/internal
- Primary nav includes Calendar; leader calendar links to the public page

## Boundaries

- INTERNAL events never appear on public APIs or ICS
- No RSVP surface on the public page
- Notify Chance email (2C) still deferred
