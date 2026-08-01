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
- Netlify site password + hierarchical board keys (`AYC_MASTER_KEY` + `AYC_KEY_*`)  

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
- Directory Profiles — photo, narrative, public/private notes on `/directory/:personId`  

## Phase 2 still deferred

Canonical plan: `docs/master-build-plan/10-PHASE-2-MASTER-PLAN.md`  
V3 upgrade plan: `docs/plans/AYC_V3_UPGRADE_PLAN.md`

- Replacing shared leader keys with account-based board unlock  
- Google / social OAuth  
- Notify Chance email outbox (2C) — skipped for now, add later  
- Location-level Graphic Design boards (GD stays statewide)  
- Location board Mission / Tasks / Resources parity (roster + calendar today)

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
