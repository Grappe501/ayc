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
| 2026-07-31 | Optional GD + segment home paths | `AYC_KEY_GRAPHIC_DESIGN` optional; unlock sends category/segment keys to home boards; Social Media still opens GD |
| 2026-07-31 | Phase 2F segment workspaces | HS/WC boards: develop-local-leads queue, full location coverage, server `locationType` filter; Join local-lead → tag |
| 2026-07-31 | Board key rotation | All `AYC_MASTER_KEY` / `AYC_KEY_*` rotated in Netlify; printable sheet in local `exports/` only (never git) |
| 2026-07-31 | Phase 2G scope engine | Shared `canAccessBoard` law; keys map to synthetic roles; master grants/revokes `person_leadership_roles` including LOCATION_LEAD |
| 2026-07-31 | Phase 2B applications | `/join` writes `membership_applications` only; Accept creates/links Prospective `JOIN_FORM` person; `/join/thanks` + `/leader/applications` |
| 2026-07-31 | Skip 2C for now | Notify Chance email deferred; proceed to 2H Reports |
| 2026-07-31 | Phase 2H reports | `/leader/reports` hub: thin location/category coverage + application pipeline + recent signups/assignments |
| 2026-07-31 | Phase 2 CAL calendars | One calendar per board; events written once; Main/segment/category/location rollup via query; `/leader/calendar` |
| 2026-07-31 | Calendar RSVP | `calendar_event_rsvps` person-linked INVITED/YES/NO/MAYBE; leader invite + mark; counts on event list |
| 2026-07-31 | Calendar recurrence | Master event rule (DAILY/WEEKLY/MONTHLY); expand in query window; exceptions cancel one occurrence; RSVPs stay series-level |
| 2026-07-31 | Calendar ICS export | Leader-auth `GET /api/leader-calendar-ics` returns RFC 5545 with RRULE/EXDATE; no public feed yet |
| 2026-08-01 | Public calendar | `/calendar` + `GET /api/public-calendar-events` + `GET /api/public-calendar-ics`; only `PUBLIC`+`SCHEDULED`; leaders toggle visibility (default INTERNAL) |
| 2026-08-01 | Personal login | Invite/claim-only Supabase Auth (email+password); `user_accounts` linked to `people`; leader keys remain for boards |
| 2026-08-01 | Directory Profiles | Affiliation header + photo + narrative + public/private notes; owner or leader edits; notes require login |
| 2026-08-01 | Brand Mark F | Torch + white letters + orange diamond is canonical product mark (nav, favicon, empty/404, hero) |
| 2026-08-01 | Palette v2 | Onyx all-star base (Hunter, Berry, Papaya, Onyx) + Blue Cotton instead of Dusk Blue; Midnight/Cream/Berry-deep mixed from 4-color chart; logo recolored to match |
| 2026-08-01 | Applications / Reports access | Master (Lead Organizer) key required — not any category key |
| 2026-08-01 | V3 upgrade plan | `docs/plans/AYC_V3_UPGRADE_PLAN.md` is planning authority for next major cycle |
| 2026-08-01 | Public site | Netlify visitor password removed — share landing freely |
| 2026-08-01 | Single login + break-glass | Boards open via account + leadership roles; shared keys remain emergency-only |
| 2026-08-01 | OG + PWA | Default OG card `/og-default.png` + `manifest.webmanifest` for share/install |
| 2026-08-01 | Calendar grid views | Shared month/week/day CalendarBoard with prev/next; event click → detail routes; embedded on Main + board pages |
| 2026-08-01 | Migration 015 | `location_id` on `team_tasks` / `team_resources` applied on production Supabase |
| 2026-08-01 | Playwright smoke | `e2e/smoke.spec.ts` covers public paths + master unlock + one category board; browsers on `H:\playwright-browsers` |
| 2026-08-01 | Password recovery | Supabase `resetPasswordForEmail` → `/forgot-password` + `/reset-password`; invite-only accounts; no open signup |
| 2026-08-03 | Google OAuth | Optional invite-gated Google login; binds/rebinds `user_accounts` or claims open invite; orphans deleted — no open signup |
| 2026-08-03 | Access audit log | `BOARD_UNLOCKED` + login/invite/application/role events on `/leader/access-log` (Lead Organizer) |
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
