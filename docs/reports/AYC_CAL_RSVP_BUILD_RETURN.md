# BUILD RETURN — Calendar RSVP

**Date:** 2026-07-31  
**Slice:** Calendar RSVP / attendance (CAL later feature)

## Done

- `calendar_event_rsvps` table (`011_calendar_event_rsvps.sql`)
- `GET|POST|PATCH|DELETE /api/leader-calendar-rsvps`
- Invite from roster search; mark INVITED / YES / NO / MAYBE; remove
- Event list shows RSVP counts; Calendar page RSVP panel
- Scope follows source board access (same as event edit)

## Boundaries

- Leader-managed only (no public self-RSVP, no email/SMS)
- No attendance check-in status beyond YES
- No recurrence / ICS
