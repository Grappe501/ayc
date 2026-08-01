# BUILD RETURN — Phase 2G Scope Engine

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2G-SCOPE-ENGINE`

## Done

- Shared product-law module `shared/access/canAccessBoard.ts`
- Unlock keys bridge to synthetic role grants; server + client scope helpers use the same law
- `GET|POST|PATCH /api/leadership-roles` — list / grant / revoke (grant+revoke master-only)
- Contact detail Leadership roles panel (grant LOCATION_LEAD, category, segment, GD, Lead Organizer)
- LOCATION_LEAD grants are person-linked and location-scoped
- Validate + unit tests (product-law matrix)

## Boundaries

- Env keys remain the unlock path (no per-person codes / OAuth yet)
- Write APIs still accept any registered key (board-scoped writes later)
- LOCATION_TEAM_LEAD / volunteer board enforcement deferred
