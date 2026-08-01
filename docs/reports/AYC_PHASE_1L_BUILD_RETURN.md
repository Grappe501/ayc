# BUILD RETURN — Phase 1L / Upgrade #4 (Duplicate Merge)

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-1L-DUPLICATE-MERGE-1.0`

## Done

- Migration `003_person_merge.sql`: `person_merge_history` + `PERSON_MERGED` audit event
- Pairwise duplicate scan reusing Volume IV scoring (`findDuplicatePairs`)
- APIs: `GET /api/duplicate-queue`, `POST /api/merge-contacts`
- Leader UI: `/leader/duplicates` — compare pair, choose survivor, merge & next
- Leader Board entry points: header + Needs attention card
- Unit tests for survivor preference + exact-match pairing

## Merge behavior

1. Leader picks surviving person
2. Unique contact methods / affiliations / team assignments move to survivor
3. Conflicting exact contact methods on loser are archived (kept on survivor)
4. Same-team assignments collapse (LEAD wins)
5. Loser archived as `DUPLICATE_RECORD`
6. `person_merge_history` + audit on survivor and loser

## Live after deploy

https://arkansasyouth.netlify.app/leader/duplicates
