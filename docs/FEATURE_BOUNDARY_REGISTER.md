# Feature Boundary Register

## Phase 1 allowed

- Vision landing, shell, navigation  
- Contacts, locations, teams, directory, feedback  
- Statewide Leader Board + five Team Lead Boards under `/leader/teams/:slug` (roster, gaps, assign)  
- Leader-gated feedback inbox (`/leader/feedback`) for status/severity/notes triage  
- Duplicate review + merge (`/leader/duplicates`) into survivor; archive loser with merge history  
- Preferred contact method + text-ready flags on Leader Board / gap fill / contact form  
- Public Join page (`/join`) → Prospective people (`JOIN_FORM`) on chosen team + feedback notify  
- Netlify site password + hierarchical board keys (`AYC_MASTER_KEY` + `AYC_KEY_*`)  

## Phase 1 deferred (see Phase 2 master plan)

Canonical plan: `docs/master-build-plan/10-PHASE-2-MASTER-PLAN.md`

- Full board network: statewide category, location TEAM, location category, Graphic Design under Social Media  
- Lead Organizer admin + Category / HS / Working Class Lead Organizer roles  
- Public Join CTA + membership applications  
- Transactional email notify to Chance on adds/signups  
- Nested calendars (own CAL track)  
- Reports hub  
- Per-lead RBAC (scope engine; auth hardens over slices)

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
