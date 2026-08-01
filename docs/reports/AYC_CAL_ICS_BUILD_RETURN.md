# BUILD RETURN — Calendar ICS Export

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2-CAL-ICS`

## Done

- RFC 5545 builder (`server/domain/calendarIcs.ts`) with RRULE + EXDATE
- `GET /api/leader-calendar-ics` — authenticated download for current board/rollup
- Calendar page **Download ICS** button (current month through +5 months)

## Boundaries

- No public / unauthenticated ICS URL
- No ICS import
- Voter-file / bulk data exports remain out of scope
