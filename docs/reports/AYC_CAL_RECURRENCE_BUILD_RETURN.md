# BUILD RETURN — Calendar Recurrence

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2-CAL-RECURRENCE`

## Done

- Migration `012_calendar_recurrence.sql` — frequency/interval/until/count + `calendar_event_exceptions`
- List expands series in the visible window (no duplicated event rows)
- Create recurring events from `/leader/calendar`
- Cancel one occurrence vs cancel whole series
- RSVPs remain on the series master (not per occurrence)

## Boundaries

- No RRULE import/export, no ICS
- No “this and following” edit, no per-occurrence overrides beyond cancel
- No public calendars
