# BUILD RETURN — Phase 2F Segment Lead Workspaces

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2F-SEGMENT-LEAD-BOARDS`

## Done

- HS / WC segment pages upgraded from shells to workspaces
- Server roster filter `locationType` + attention `localLeadCandidate` / `categoryLeadCandidate`
- Develop local leads queue (`LOCAL_LEAD_CANDIDATE` ∪ `READY_TO_LEAD`)
- Full location coverage list (all HS or COUNTY) with thin-coverage sorting
- Join `local-lead` / `category-lead` auto-applies pipeline tags
- Board keys rotated in Netlify; printable sheet only under local `exports/` (gitignored)

## Boundaries

- No person-linked RBAC / LOCATION_LEAD grants → 2G  
- No applications inbox → 2B  
- No segment calendars → CAL  
- Segment keys still cannot open location category boards (category ownership unchanged)
