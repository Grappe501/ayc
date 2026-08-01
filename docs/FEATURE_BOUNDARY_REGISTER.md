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

## Phase 2 still deferred

Canonical plan: `docs/master-build-plan/10-PHASE-2-MASTER-PLAN.md`

- Per-person unlock / OAuth accounts (identity path after keys)  
- Notify Chance email outbox (2C)  
- Nested calendars (CAL track), reports hub (2H)  
- Location-level Graphic Design boards (GD stays statewide)

## Phase 1 forbidden

- Individual accounts / OAuth  
- Email / SMS / messaging  
- Events / training / AI  
- Imports / exports / voter files  
- Public unprotected site features  
- Cross-project database connections  
- Rewriting canonical mission  

## Phase 1B specifically

Landing content and presentation only — no database, no contact forms, no directory search.
