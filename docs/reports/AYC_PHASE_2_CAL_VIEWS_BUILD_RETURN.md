# BUILD RETURN — Calendar month / week / day views

**Date:** 2026-08-01  
**Slice:** `AYC-PHASE-2-CAL-VIEWS`

## Done

- Shared `CalendarBoard`: month, week, day; Previous / Next / Today
- Event titles placed on the grid; click opens drill-down
- Leader: `/leader/calendar/event/:eventId` (details + RSVPs + cancel)
- Public: `/calendar/event/:eventId`
- Embedded board calendars on Main Leader Board, category/segment/location boards

## Boundaries

- Embeds use the board’s rollup scope; full hub remains `/leader/calendar`
