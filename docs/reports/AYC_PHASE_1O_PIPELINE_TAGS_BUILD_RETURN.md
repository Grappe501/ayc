# BUILD RETURN — Phase 1O Pipeline Tags / Upgrade #10

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-1O-PIPELINE-TAGS-1.0`

## Done

- Migration `006_pipeline_tags.sql` (`person_pipeline_tags`) + audit `PIPELINE_TAG_ADDED` / `REMOVED`
- API: `GET|PATCH /api/pipeline-tags` (catalog + replace set)
- Roster/detail include `pipelineTags`; filter `pipelineTag`; attention counts for ready / mentoring / future
- Contact detail Leadership pipeline editor; Leader Board filter + attention cards
- Validate + unit tests

## Boundaries

- Controlled tags only (no free-form labels)
- Tags: FUTURE_LEADER · NEEDS_MENTORING · READY_TO_LEAD · LOCAL_LEAD_CANDIDATE · CATEGORY_LEAD_CANDIDATE
- Soft-archive on remove (row kept with `archived_at`)
