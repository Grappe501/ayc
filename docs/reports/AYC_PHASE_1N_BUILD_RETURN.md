# BUILD RETURN — Phase 1N / Upgrade #6 (Per-team attention digests)

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-1N-TEAM-ATTENTION-DIGESTS-1.0`

## Done

- Pure digest builder: roster → per-team open items + top issues
- API: `GET /api/team-digests` (sorted by urgency)
- Leader Board section **Team attention digests** with open-item cards
- Team Lead Boards use digest counts (not filter-skewed roster) for Needs attention
- Unit tests for digest scoring / sort

## Digest counts

Per team: roster, leads, volunteers, locations, missing contact, prospective, join form, needs preferred, text-ready, no-lead flag, openItems, topIssues.
