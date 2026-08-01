# Phase 2 Master Plan — Hierarchy, Boards, Join, Notify, Calendars

**Status:** Draft for build sequencing (2026-07-31)  
**Owner product authority:** Chance Bradford (Lead Organizer / system administrator)  
**Workspace:** `H:\AYC`  
**Relationship to Phase 1:** Phase 1 remains the contact OS + thin Team Lead Boards. Phase 2 turns that into the real organizational operating system.

This document expands Steve’s hierarchy and feature intent into concrete systems, data shapes, access rules, routes, and delivery slices. It supersedes the thin “Phase 2 = Team Boards only” line in Volume V for AYC’s actual org model, while still respecting Phase 1 forbidden work until each slice is explicitly opened for build.

---

## 1. What we are building

Phase 2 delivers five connected systems:

| System | One-line purpose |
|--------|------------------|
| **A. Leadership hierarchy & access** | Named roles with real scope (who can see/edit what) |
| **B. Board network** | Category boards, location boards, and sub-boards that roll up |
| **C. Join Call-to-Action** | Public signup that explains positions and captures interest |
| **D. Notify Chance** | Email Chance on every person add / signup / assignment change |
| **E. Nested calendars** | Own project track: every board has a calendar; higher boards consolidate |

Systems A–D should land before (or in parallel with early slices of) E. Calendar is large enough to treat as **Phase 2-Calendar** with its own slice registry.

---

## 2. Organizational hierarchy (canonical)

```
Lead Organizer (Chance Bradford) — system administrator
│
├── Inner Circle (Lead Organizer Leadership Team)
│   ├── Category Campaign Leads (statewide)
│   │   ├── Organizer Lead
│   │   ├── Voter Registration Lead
│   │   ├── Social Media Lead
│   │   │   └── Graphic Design Lead  ← secondary board under Social Media
│   │   ├── Events Lead
│   │   └── Outreach Lead
│   ├── High School Lead Organizer
│   └── Working Class Lead Organizer
│
├── Location layer
│   ├── College locations → location TEAM board + category boards at that location
│   ├── High School locations → HS boards (HS Lead Organizer develops local lead organizers)
│   └── County / non-student (“Working Class”) locations → county boards
│
└── Members / volunteers on teams
```

### 2.1 Role definitions

| Role | Scope | Core job |
|------|-------|----------|
| **Lead Organizer (System Admin)** | Entire system | Full access to every person, board, report, calendar, signup queue. Assigns all other leads. Chance. |
| **Category Campaign Lead** | One category statewide | Owns that category’s statewide board and **all** location boards of that category (college + HS + working class). Mentors location leads in that category. Sits on Lead Organizer’s leadership team. |
| **Graphic Design Lead** | Graphic Design board (under Social Media) | Owns one shared statewide graphic design group. All designers (every location/type) live here. Reports to Social Media Lead; Lead Organizer still has full access. |
| **High School Lead Organizer** | All high school locations | Helps recruit/develop lead organizers in every school; sees HS location boards and HS-relevant rollups. Not a substitute for Category Leads (categories still lead their HS boards). |
| **Working Class Lead Organizer** | All non-student county boards | Same pattern as HS Lead Organizer for county / working-class locations. |
| **Location Lead Organizer** (future / developed by HS & WC leads) | One location | Runs that location’s TEAM board; coordinates category teams at the location. |
| **Location Category Lead / Volunteer** | One team at one location | Day-to-day work on that board. |
| **Prospect / Applicant** | Signup only | Submitted via Join form; not yet active until Chance or a lead converts them. |

### 2.2 Access rules (product law)

1. **Chance sees everything.** No board, person, report, or calendar is hidden from Lead Organizer.
2. **Category Leads see their category everywhere** — college, high school, and working class boards of that category, plus the statewide category board.
3. **Social Media Lead also sees Graphic Design** (parent of that secondary board). Graphic Design Lead sees Graphic Design only (plus what Chance grants later if needed).
4. **HS Lead Organizer** sees all **high school location** TEAM boards and HS rollups; does not automatically get county or college unless also holding another role.
5. **Working Class Lead Organizer** sees all **county / non-student** TEAM boards and WC rollups; not HS/college unless dual-roled.
6. **Category Leads remain the functional bosses of their boards at every location type.** HS/WC Lead Organizers develop *people and location leadership*; they do not replace category ownership.
7. Phase 2 starts with **role-based access** (not full OAuth accounts if we choose a lighter gate first)—but the *model* must assume real identity so we do not rebuild twice.

---

## 3. Board taxonomy

### 3.1 Board kinds

| Kind | Example | Owns |
|------|---------|------|
| **Statewide Category Board** | Social Media Lead Board | Statewide roster for that category, statewide calendar, rollup of all location category boards, reports |
| **Secondary / Sub-board** | Graphic Design (child of Social Media) | Own roster + calendar; rolls into Social Media; all designers statewide in one group |
| **Location TEAM Board** | UAPB Team Board | All members at that location, contacts, **location calendar** (consolidates that location’s team calendars) |
| **Location Category Board** | UAPB Social Media | Team members for that category at that location; own calendar; rolls to location TEAM + statewide category |
| **Segment Lead Board** | High School Lead Organizer Board | Rollup of all HS location TEAM boards; pipeline of school lead organizers |
| **Segment Lead Board** | Working Class Lead Organizer Board | Rollup of all county / non-student TEAM boards |
| **Lead Organizer / Main Board** | Chance’s command board | Everything: people, all boards, signup inbox, **Main Calendar**, reports |

### 3.2 Inheritance / rollup (people & calendars)

```
Main (Lead Organizer)
  ↑ consolidates
Statewide Category Boards (+ Graphic Design under Social Media)
  ↑ consolidates
Location Category Boards
  ↑ also feed → Location TEAM Board
Segment boards (HS / WC) consolidate their location TEAM boards
```

**Calendar inheritance (same tree):**

- Entry created on a **Location Category Board** appears on:
  1. that board’s calendar  
  2. that **Location TEAM** calendar  
  3. the **Statewide Category** calendar  
  4. (if location is HS) **HS Lead Organizer** calendar  
  5. (if location is county/WC) **Working Class Lead Organizer** calendar  
  6. **Main Calendar** (everything)

- Graphic Design events appear on Graphic Design → Social Media statewide → Main (and location only if we later attach designers to locations; v1 = statewide pool).

### 3.3 Phase 1 → Phase 2 mapping

| Phase 1 today | Phase 2 becomes |
|---------------|-----------------|
| `/leader` shared-secret Leader Board | Lead Organizer command board (+ still the contact OS) |
| Five `/leader/teams/:slug` thin boards | Full Statewide Category Boards |
| Teams: organizer, voter-registration, social-media, events, outreach | Same five + **graphic-design** (child of social-media) |
| Locations COLLEGE / HIGH_SCHOOL / COUNTY | COLLEGE / HIGH_SCHOOL / COUNTY(=Working Class) |
| Chance = Organizer LEAD in seed | Chance = `LEAD_ORGANIZER` system admin role |
| LEAD / VOLUNTEER only | Expanded role + scope model (below) |

---

## 4. Data model sketch (additive)

Do **not** rewrite Phase 1 tables casually. Prefer additive migrations.

### 4.1 Roles & scope

```
leadership_roles
  id, code, label
  -- LEAD_ORGANIZER, CATEGORY_LEAD, GRAPHIC_DESIGN_LEAD,
  -- HS_LEAD_ORGANIZER, WC_LEAD_ORGANIZER,
  -- LOCATION_LEAD, LOCATION_TEAM_LEAD, VOLUNTEER

person_leadership_roles
  person_id, role_code
  team_id nullable          -- required for CATEGORY_LEAD / GRAPHIC_DESIGN_LEAD / LOCATION_TEAM_LEAD
  location_id nullable      -- required for LOCATION_LEAD / location-scoped roles
  segment nullable          -- HIGH_SCHOOL | WORKING_CLASS | COLLEGE | ALL
  is_primary boolean
  granted_by, granted_at, revoked_at
```

**Chance:** `LEAD_ORGANIZER` + optional Organizer category LEAD for continuity.

### 4.2 Board registry

```
boards
  id, kind, slug, name
  parent_board_id nullable     -- Graphic Design → Social Media
  team_id nullable
  location_id nullable
  segment nullable             -- for HS / WC lead boards
  calendar_id                  -- 1:1 with calendars
```

Seed boards for: Main, five statewide categories, Graphic Design (parent = Social Media), HS Lead Organizer, WC Lead Organizer, then generate Location TEAM + Location Category boards as locations/teams come online.

### 4.3 Join / applications

```
membership_applications
  id, created_at, status  -- NEW | REVIEWING | ACCEPTED | DECLINED | DUPLICATE
  first_name, last_name, preferred_name
  email, phone, city, county
  age_band or birth_year (policy TBD)
  location_interest_type  -- COLLEGE | HIGH_SCHOOL | WORKING_CLASS | UNSURE
  location_name_freeform / location_id
  primary_team_interest    -- one of five + graphic-design + unsure
  secondary_interests[]
  wants_to_lead_local boolean
  wants_category_lead boolean
  experience_notes, availability_notes, how_heard
  assigned_to_person_id nullable  -- after accept → creates/links person
```

### 4.4 Notifications outbox

```
notification_outbox
  id, channel (EMAIL), template_key
  to_address                 -- ayc.ark.hq@gmail.com for Chance alerts
  payload jsonb
  related_entity_type, related_entity_id
  status, attempts, last_error, created_at, sent_at
```

Triggers (v1): person created, application submitted, person assigned to team/location, role granted, application accepted/declined.

### 4.5 Calendars (Phase 2-Calendar track)

```
calendars
  id, board_id, name, kind

calendar_events
  id, source_calendar_id     -- board where created
  title, description
  starts_at, ends_at, all_day
  location_text, url
  visibility, status
  created_by_person_id
  -- rollup is QUERY/VIEW by board tree, not duplicated rows
```

Rollup = resolve board ancestry + segment rules; query events whose `source` board is in the visible set. Avoid copying events into every parent calendar.

---

## 5. Product surfaces & routes (proposed)

| Route | Audience | Purpose |
|-------|----------|---------|
| `/` | Public | Vision + **Join Call-to-Action** |
| `/join` | Public | Signup form (positions explained) |
| `/join/thanks` | Public | Confirmation + what happens next |
| `/leader` | Lead Organizer (+ elevated) | Command board: roster, gaps, signup inbox, reports entry |
| `/leader/applications` | Lead Organizer (+ delegated) | Review join queue |
| `/leader/teams/:slug` | Category Lead + admin | Statewide Category Board |
| `/leader/teams/social-media/graphic-design` | GD Lead + Social Media Lead + admin | Graphic Design secondary board |
| `/leader/segments/high-school` | HS Lead Organizer + admin | HS rollup board |
| `/leader/segments/working-class` | WC Lead Organizer + admin | WC / county rollup board |
| `/leader/locations/:locationId` | Location leads + scoped leads + admin | Location TEAM board |
| `/leader/locations/:locationId/teams/:slug` | Location category leads + category lead + admin | Location Category Board |
| `/leader/calendar` | By role scope | Main or scoped calendar views |
| `/leader/reports` | Lead Organizer first; expand later | Reports hub |

Public `/teams/...` remains reserved until RBAC is real. Prefer keeping operator surfaces under `/leader/*` for Phase 2 continuity.

---

## 6. System C — Join Call-to-Action (detail)

### 6.1 Landing placement

On the main screen (`/`): a clear **CALL TO ACTION** section (not buried):

- Headline: invite to join AYC leadership / teams  
- Short explanation of the five categories + Graphic Design + location types  
- Primary button → `/join`  
- Secondary → Directory or Leader Board as appropriate  

### 6.2 Form must capture

- Identity & contact (name, email, phone)  
- Geography (city/county; school/college/county interest)  
- Age eligibility confirmation (16–24 policy — exact fields TBD with Steve)  
- **Team interest** (required primary; optional secondaries) including Graphic Design  
- **Leadership interest:**  
  - Interested in leading a team in my area  
  - Interested in being a statewide category lead  
  - Just want to volunteer for now  
- Free-text: experience, why AYC, availability  
- Consent: contact + privacy note  

### 6.3 Positions explained (content blocks on `/join`)

Plain-language cards for:

1. Organizer  
2. Voter Registration  
3. Social Media (+ note that Graphic Design sits with Social Media)  
4. Events  
5. Outreach  
6. High School path vs Working Class / county path vs College  

### 6.4 After submit

1. Save `membership_applications`  
2. Enqueue email to **ayc.ark.hq@gmail.com**  
3. Show thanks page: Chance or a lead will follow up  
4. Chance reviews in `/leader/applications` → Accept creates/links `people` + assignments  

---

## 7. System D — Notify Chance (detail)

**Policy:** Any time a person is **added** or an application is **submitted**, Chance gets email at `ayc.ark.hq@gmail.com`.

Recommended v1 events:

| Event | Subject pattern |
|-------|-----------------|
| Join application submitted | `[AYC Join] {Name} — {team interest}` |
| Contact created (leader form) | `[AYC Contact] {Name} added at {location}` |
| Accepted from application | `[AYC Accepted] {Name} → {team/location}` |
| Role granted (lead assigned) | `[AYC Role] {Name} → {role}` |

Implementation options (choose in slice kickoff):

1. **Netlify Function + transactional email provider** (Resend / Postmark / SendGrid) — preferred for reliability  
2. **Supabase Edge + SMTP** — only if already standardized  

Phase 1 forbade email; Phase 2 explicitly opens **transactional email for admin notify only** (not member messaging). Still no SMS in this plan unless separately approved.

Store secrets in Netlify env; never commit. Log to `notification_outbox` for retry/audit.

---

## 8. System E — Nested calendars (own project)

Treat as **Phase 2-Calendar** with its own slices. Do not block Join + Hierarchy on full calendar UX.

### 8.1 Principles

1. Every board has exactly one calendar.  
2. Events are written once to a **source board** calendar.  
3. Higher boards **query** descendant sources (rollup views).  
4. Main Calendar = union of all events Chance is allowed to see (= all).  
5. Location TEAM calendar = union of that location’s category boards (+ location-wide events).  
6. Edit/delete permissions follow board access; parents can view; source board leads can edit (admin can always edit).

### 8.2 MVP calendar features

- Create / edit / cancel event  
- Title, time range, all-day, description, place/link  
- Month + list views  
- Filter by category / location / segment  
- “Belongs to” badge showing source board  

### 8.3 Later calendar features

- RSVP / attendance  
- Public vs internal visibility  
- Recurrence  
- ICS export  
- Conflict warnings across categories at a location  

### 8.4 Suggested calendar slices

| Slice | Deliverable |
|-------|-------------|
| CAL-0 | Schema + board↔calendar seed |
| CAL-1 | Event CRUD API + permissions |
| CAL-2 | Board calendar UI (month/list) |
| CAL-3 | Rollup queries (location → category → main) |
| CAL-4 | Segment calendars (HS / WC) |
| CAL-5 | Main Calendar + filters + reports hooks |

---

## 9. Reports (Lead Organizer)

Chance’s admin surface needs early report stubs that grow:

- Roster completeness (gaps) by team / location / segment  
- Pipeline: applications NEW → ACCEPTED  
- Leadership coverage: which locations lack a location lead or category lead  
- Activity: recent signups, recent assignments  
- Calendar density (after CAL-3): events per region/team  

Reports are **Lead Organizer first**; Category Leads get category-scoped reports in a later slice.

---

## 10. Access implementation path (practical)

Phase 1 uses shared leader secret. Phase 2 should not jump to full OAuth on day one unless required.

**Recommended path:**

| Step | Approach |
|------|----------|
| 2A | Keep shared secret for Lead Organizer; encode hierarchy in **data** (roles on Chance + named leads) even if UI still uses one unlock |
| 2B | Per-lead unlock codes or magic-link emails (still light) scoped by `person_leadership_roles` |
| 2C | Real accounts (email login) when multiple concurrent leads need isolation |

**Product rule:** Build the **scope engine** early (`canAccessBoard(person, board)`). Swap auth front-ends later without rewriting boards.

---

## 11. Delivery slices (Phase 2 registry proposal)

Register these in `docs/PHASE_AND_SLICE_REGISTRY.md` when build opens.

| Slice | Name | Outcome |
|-------|------|---------|
| **2A** | Hierarchy foundation | Roles table, Chance = LEAD_ORGANIZER, board registry, Graphic Design team/board under Social Media, HS/WC segment boards (shell) |
| **2B** | Join CTA + applications | Landing CTA, `/join` form, thanks page, applications inbox for Chance |
| **2C** | Notify Chance | Outbox + email to `ayc.ark.hq@gmail.com` on add/signup |
| **2D** | Category Board upgrade | Full statewide category boards (mission/roster/tasks-light/resources-light) beyond Phase 1 thin boards |
| **2E** | Location TEAM + Location Category boards | Per-location surfaces; Working Class = COUNTY; HS locations under HS segment |
| **2F** | Segment Lead Organizer boards | HS + WC lead organizer workspaces + “develop local leads” queues |
| **2G** | Scope engine + lead unlock | Enforce who sees which board |
| **2H** | Reports v1 | Coverage + pipeline for Chance |
| **CAL-0…5** | Nested calendars | Separate track per §8 |

**Suggested first build order:** 2A → 2B → 2C → 2G (minimum scope) → 2D/2E → 2F → 2H, with CAL starting after 2A board registry exists.

---

## 12. Explicit non-goals (until separately approved)

- Member-to-member messaging / SMS blasts  
- Voter file import/export  
- AI features  
- Public unprotected write surfaces beyond `/join`  
- Replacing canonical mission copy  
- Full OAuth social login (optional later)  
- Attendance / event registration (calendar later slices)  

---

## 13. Open decisions for Steve

1. **Working Class = COUNTY locations only**, or also “non-enrolled youth” at college towns as a person flag?  
2. **Age gate fields** on `/join` — exact collection (birthdate vs checkbox “I am 16–24”).  
3. **Category Lead names** — leave seats vacant in UI (“Seat open”) until named?  
4. **Graphic Design** — volunteers only under Social Media, or also appear on location TEAM rosters when they have a home location? (Plan default: statewide pool first.)  
5. **Auth timing** — stay on shared secret through 2B/2C, or introduce per-lead codes at 2G immediately after Join?  
6. **Email provider** — Resend vs Postmark vs other (needs API key in Netlify).  
7. **College Lead Organizer** — is there a third segment lead later, or do Category Leads + Chance cover college? (Plan default: no separate College Lead Organizer yet.)  
8. **Public directory** — do applicants appear before acceptance? (Default: **no**.)  

---

## 14. Success criteria for Phase 2 “operating”

Phase 2 is working when:

1. Chance can open any board and any person without a second tool.  
2. Each Category Lead (once named) has a statewide home board and can see that category at every location type.  
3. Graphic Design is one shared board under Social Media with one lead seat.  
4. HS and Working Class Lead Organizers have rollup boards and a pipeline to develop location lead organizers.  
5. A stranger can hit **Join** on the landing page, submit a complete application, and Chance gets email within minutes.  
6. Location TEAM boards show people + a consolidated location calendar; Main Calendar shows everything.  
7. Reports answer: where are we thin on leads, and who just signed up?

---

## 15. Document control

| Item | Value |
|------|-------|
| Canonical mission | Unchanged — Volume VII / `02-AYC-VISION-CANONICAL.md` |
| Phase 1 boundary | Still enforced until slices above are opened for build |
| Notify address | `ayc.ark.hq@gmail.com` |
| This plan | Living doc — update when open decisions close |

**Next step after approval:** close §13 decisions, then open slice **2A** (hierarchy foundation) and **2B** (Join CTA) as the first implementation pair.
