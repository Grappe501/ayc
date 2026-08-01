# Decision Log

| Date | Decision | Notes |
|------|----------|-------|
| 2026-07-31 | Workspace `H:\AYC` | Not SOSWebsite nested path |
| 2026-07-31 | GitHub `Grappe501/ayc` | Continuous push to `main` for Netlify |
| 2026-07-31 | Canonical mission locked | Volume VII wording — no rewrites |
| 2026-07-31 | Phase 1A Design System | Light Arkansas Blue / Green / Gold tokens |
| 2026-07-31 | Phase 1B landing | Full vision page; mission emphasis without text change |
| 2026-07-31 | Phase 1C data foundation | Drizzle + postgres.js; SQL migrations; server-only DB access |
| 2026-07-31 | Phase 1D leader write path | Shared secret header; unlock + contact/location APIs |
| 2026-07-31 | Phase 1E contact management | Detail/edit/archive/restore with audit + duplicate recheck |
| 2026-07-31 | Phase 1F directory | Public read APIs; contact masking unless leader unlocked |
| 2026-07-31 | Phase 1G beta feedback | Public submit API; AYC-FB reference codes; page context via `from` |
| 2026-07-31 | Phase 1H beta readiness | A11y/security hardening + Gate 6 docs pack |
| 2026-07-31 | Team Lead Boards under `/leader` | Five boards (Organizer, Voter Registration, Social Media, Events, Outreach); Phase 2 full dashboards still deferred |
| 2026-07-31 | Gate 6 technical close | Site password on; DB + env live; validate green; product-owner device QA still open |
| 2026-07-31 | Contact gap-fill sprint | `/leader/gaps` one-at-a-time phone/email queue for Chance |
| 2026-07-31 | Feedback inbox under `/leader` | Chance triage at `/leader/feedback`; public `/feedback` stays submit-only; no `/admin` |
| 2026-07-31 | Brand palette refresh | Sage `#556B4E`, blue `#4F7EA8`, stone `#8a857a`, tan `#D7C9B1`, clay `#A85d3B`, cream `#F5F1E8` |
| 2026-07-31 | Clay as action accent | Primary buttons, brand mark, nav active, FABs, and landing accents use clay; blue kept for headings/focus |
| 2026-07-31 | Palette refresh | BG `#F5F5F5`, dominant `#2E5A3D`, secondary `#FF6B35`, tertiary `#00A3FF`, splash `#6A5ACD` |
| 2026-07-31 | Launch styling harden | Deeper elevation, surface tints, nav/table/form polish for beta launch readiness |
| 2026-07-31 | Phase 2 master plan drafted | Hierarchy (Chance admin, category/HS/WC leads, Graphic Design under Social Media), Join CTA, notify email, nested calendars as CAL track — `10-PHASE-2-MASTER-PLAN.md` |
| 2026-07-31 | Landing → newcomer first | Public home educates what/why/how; Join CTA primary; Leader Workbench at bottom |
| 2026-07-31 | Hierarchical board keys | `AYC_MASTER_KEY` opens all boards; `AYC_KEY_*` category/segment keys open hierarchy; write APIs accept any registered key |
| 2026-07-31 | Green canvas theme | Page background `#2E5A3D` with light text; light surfaces keep dark text |
| 2026-07-31 | Join → Prospective pipeline | `/join` creates people with status `PROSPECTIVE`, source `JOIN_FORM`, on selected team board |
| 2026-07-31 | Duplicate merge (#4) | `/leader/duplicates` queue + merge into survivor; `person_merge_history` + `PERSON_MERGED` audit |
| 2026-07-31 | Text-ready flags (#5) | Preferred contact surfaced on roster; text-ready = phone + TEXT/EITHER (+ phone consent when marked) |
| 2026-07-31 | Team attention digests (#6) | Per-team open-item digests on Leader Board + team boards via `GET /api/team-digests` |
| 2026-07-31 | Team Board Mission (#7) | Category mission packs + Today’s priorities on `/leader/teams/:slug` (content-driven; not canonical mission rewrite) |
| 2026-07-31 | Team Board Tasks (#8) | `team_tasks` table + `/api/team-tasks` + Tasks panel on Team Lead Boards (OPEN/DONE/CANCELLED) |
| 2026-07-31 | Team Board Resources (#9) | `team_resources` + `/api/team-resources` + Resources panel (LINK/NOTE/TALKING_POINT/CHECKLIST) |
| 2026-07-31 | Leadership pipeline tags (#10) | Controlled tags on `person_pipeline_tags`; contact editor + Leader Board filter/attention; no free-form tags |
| 2026-07-31 | Phase 2A hierarchy foundation | Roles + boards registry; Graphic Design under Social Media; HS/WC segment shells; Chance = LEAD_ORGANIZER in data |
| 2026-07-31 | Phase 2E location boards | Auto LOCATION_TEAM + 5 LOCATION_CATEGORY boards per location; routes under `/leader/locations`; GD not location-scoped |
