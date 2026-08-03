# Feature Boundary Register

## Phase 1 allowed

- Vision landing, shell, navigation  
- Contacts, locations, teams, directory, feedback  
- Statewide Leader Board + five Team Lead Boards under `/leader/teams/:slug` (roster, gaps, assign)  
- Leader-gated feedback inbox (`/leader/feedback`) for status/severity/notes triage  
- Duplicate review + merge (`/leader/duplicates`) into survivor; archive loser with merge history  
- Preferred contact method + text-ready flags on Leader Board / gap fill / contact form  
- Per-team attention digests (gaps, joins, preferred, missing leads) on Leader Board  
- Team Board Mission module (charge, priorities, focus, lead owns, success) on `/leader/teams/:slug`  
- Team Board Tasks-light (`team_tasks`) create / complete / cancel on category boards  
- Team Board Resources-light (`team_resources`) links, notes, talking points, checklists  
- Leadership pipeline tags (controlled set) on contacts + Leader Board filter/attention  
- Public Join page (`/join`) → applications queue (person created on Accept)  
- Hierarchical board keys (`AYC_MASTER_KEY` + `AYC_KEY_*`) as **break-glass**; day-to-day boards via invite login + `person_leadership_roles`  
- Public site (no Netlify visitor password) — landing/join/directory/calendar shareable  

## Phase 2 opened

- Roles catalog + `person_leadership_roles` + `boards` registry  
- Graphic Design secondary board under Social Media (`/leader/teams/social-media/graphic-design`)  
- HS / WC segment workspaces (`/leader/segments/*`)  
- Hierarchical keys including optional `AYC_KEY_GRAPHIC_DESIGN`  
- Location TEAM + five location category boards per location (`/leader/locations/*`)  
- HS / WC segment workspaces with develop-local-leads queues + location coverage  
- Scope engine `canAccessBoard` + person leadership role grants (keys remain for unlock)  
- Membership applications queue (`membership_applications`) + `/leader/applications` accept/decline  
- Reports hub (`/leader/reports`) — coverage + pipeline for Chance  
- Nested calendars (`/leader/calendar`) — one calendar per board, rollup by query  
- Calendar RSVP / attendance — person-linked YES/NO/MAYBE/INVITED on events  
- Calendar recurrence — daily/weekly/monthly series with occurrence cancel exceptions  
- Calendar ICS export — leader-authenticated `.ics` download (RRULE + EXDATE)  
- Public calendar — `/calendar` + unauthenticated ICS of `visibility=PUBLIC` events only  
- Calendar month/week/day grids with scroll navigation + event detail drill-down (leader + public); board page embeds  
- Personal login (invite/claim) — Supabase Auth email+password; `user_accounts` ↔ `people`  
- Password recovery — `/forgot-password` + `/reset-password` via Supabase Auth reset email  
- Google OAuth (optional) — invite-gated only; binds to `user_accounts` / open invite; no open signup  
- Access audit log — `/leader/access-log` (master): board unlocks, account logins, invites, application accept/decline, role grant/revoke  
- Directory Profiles — photo, narrative, public/private notes on `/directory/:personId`  

## Phase 2 still deferred

Canonical plan: `docs/master-build-plan/10-PHASE-2-MASTER-PLAN.md`  
V3 upgrade plan: `docs/plans/AYC_V3_UPGRADE_PLAN.md`

- Other social OAuth providers (Apple, etc.)  
- Notify Chance email outbox (2C) — skipped for now, add later  
- Location-level Graphic Design boards (GD stays statewide)  
- ~~Location category Tasks / Resources~~ shipped 2026-08-01 (`location_id` on team_tasks / team_resources)

## Phase 1 forbidden

- Open public signup (accounts remain invite/claim only)  
- Email / SMS / messaging  
- Events / training / AI  
- Imports / exports / voter files  
- Public unprotected site features  
- Cross-project database connections  
- Rewriting canonical mission  

## Phase 1B specifically

Landing content and presentation only — no database, no contact forms, no directory search.
