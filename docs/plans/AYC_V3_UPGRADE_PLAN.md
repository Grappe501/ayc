# AYC V3 Upgrade Plan — Leadership Workbench

**Date:** 2026-08-01  
**Status:** Planning authority for the next major upgrade cycle  
**Basis:** Full surface audit of live routes, workbenches, lanes, auth, brand, and deferred Phase 2 items  
**Live product today:** Phase 1 + Phase 2 Leadership Workbench on [arkansasyouth.netlify.app](https://arkansasyouth.netlify.app)

---

## 1. Executive verdict

AYC already has a working operating system: vision landing, join → applications, directory profiles, nested calendars, statewide / segment / location boards, contacts, gaps, duplicates, reports, and dual access (shared keys + invite login).

What V3 must do is **unify identity, deepen thin boards, close trust loops, harden privilege, and make the product feel like one branded coalition OS** — not a beta shell with powerful tools hiding behind keys.

V3 is not a rewrite. It is a **substantial upgrade** of the system we have.

---

## 2. What we audited (baseline)

### 2.1 Public surfaces

| Surface | Status | V3 pressure |
|---------|--------|-------------|
| Home / vision landing | Live, strong | Keep mission locked; retire stale “coming next”; brand continuity |
| Join + thanks | Live | Close Notify Chance; improve post-accept onboarding |
| Public calendar + event detail | Live | Member registration later; better discovery from landing |
| Directory people / teams / locations | Live | Deeper location → board paths; privacy polish |
| Directory profiles | Live + edit mode | Richer story fields; photo crop; ownership clarity |
| Feedback | Live | Completer page catalog; triage SLAs |
| Login / claim | Live | Merge with board unlock narrative |
| 404 | Live | Brand + recovery paths |

### 2.2 Workbench hierarchy (lanes)

```
Lead Organizer (master)     /leader
├── Category boards ×5      /leader/teams/{organizer|voter-registration|social-media|events|outreach}
│   └── Graphic Design      /leader/teams/social-media/graphic-design
├── HS segment              /leader/segments/high-school
├── WC segment              /leader/segments/working-class
├── Location TEAM           /leader/locations/:id
├── Location category ×5    /leader/locations/:id/teams/:teamSlug
├── Applications (master)   /leader/applications
├── Reports (master)        /leader/reports
├── Feedback inbox (master) /leader/feedback
├── Gaps / duplicates       /leader/gaps, /leader/duplicates
└── Nested calendars        /leader/calendar (+ embeds on boards)
```

### 2.3 Maturity gradient (the real gap)

| Lane depth | Has Mission / Tasks / Resources | Roster | Calendar | Verdict |
|------------|----------------------------------|--------|----------|---------|
| Statewide category + GD | Yes | Yes | Yes | **Operator-ready** |
| HS / WC segments | Segment tools + coverage | Via locations | Yes | **Operator-ready** |
| Location TEAM / category | **No** | Yes | Yes | **Thin — V3 priority** |

### 2.4 Identity today (the structural debt)

1. **Shared hierarchical keys** unlock boards (`LeaderAccessGate`).  
2. **Invite / claim Supabase Auth** unlocks profile edit + notes.  
3. These are **not the same login**. Members hear “Log in” and expect boards; leaders hear “Unlock” and expect accounts.

V3 success criterion #1: **one person, one account, role-derived board access.**

---

## 3. V3 North Star

> Young Arkansans join AYC, claim a real account, see a clear pathway into a team and location, and leaders run the coalition from one branded workbench where access matches responsibility — without shared passwords as the long-term model.

Canonical mission remains locked (`docs/master-build-plan/02-AYC-VISION-CANONICAL.md`). V3 upgrades the **operating system around the mission**, not the mission text.

---

## 4. Workstreams (substantial upgrade program)

### WS-A — Identity & Access Consolidation (P0)

**Goal:** Replace “two doors” with one account model; keys become break-glass only.

| # | Recommendation | Why | Outcome |
|---|----------------|-----|---------|
| A1 | Bind board unlock to `user_accounts` + `person_leadership_roles` | Deferred Phase 2 core | Login → scoped workbench |
| A2 | Keep hierarchical keys as **emergency / bootstrap** only | Chance still needs day-one access | Documented fallback |
| A3 | Role-aware home: after login, land on the highest board you own | Reduces “where do I go?” | `homePathForRoles` |
| A4 | Invite flows for category leads, segment leads, location leads | ContactDetail invite exists; extend to role grants | Invite = account + role |
| A5 | Session clarity in UI: “Signed in as … · Boards: …” | Dual-auth confusion | Trust |
| A6 | Optional Google OAuth **after** email/password is solid | Phase 2 deferred | Lower friction for 16–24 |
| A7 | Password reset / recovery emails | Missing for claim accounts | Support load ↓ |
| A8 | Audit log: who unlocked what, who accepted applications | Hardening | Accountability |

**Exit criteria:** A category lead can log in with their account, open only their boards, edit their profile, and never needs the shared category key for normal work.

---

### WS-B — Brand System Everywhere (P0 / in flight)

**Goal:** Mark F (torch + white letters + orange diamond) is the product mark, not a hero-only ornament.

| # | Recommendation | Why |
|---|----------------|-----|
| B1 | Nav mark = logo (not text “AYC” tile) | Done in this pass |
| B2 | Favicon / apple-touch from Mark F | Done in this pass |
| B3 | Footer brand + footer nav | Done in this pass |
| B4 | Empty states / 404 use small mark | Done in this pass |
| B5 | Lock canonical asset set; archive concept PNGs with a README | Design hygiene |
| B6 | OG / social share image (1200×630) with mark + mission line | Growth / join share |
| B7 | PWA manifest icons | Installable feel on mobile |
| B8 | Email templates (when Notify ships) use same mark | Trust loop |
| B9 | Printable one-pager / QR to `/join` with mark | Offline organizing |
| B10 | Light / dark-on-green mark variants documented | Placement rules |

---

### WS-C — Close the Join Trust Loop (P0)

| # | Recommendation | Why |
|---|----------------|-----|
| C1 | **Notify Chance** email (or Netlify/Resend outbox) on new application | Phase 2 success criterion still open |
| C2 | Notify category / location lead on Accept when assignable | Speed to first contact |
| C3 | Applicant status page (`/join/status/:ref`) — no account required | Reduces “did you get it?” |
| C4 | Accept → optional auto-invite to claim account | Converts applicants into members |
| C5 | Segment boards: attention from **applications queue**, not only `PROSPECTIVE` people | Align UI with real join path |
| C6 | Decline reasons + polite email template | Dignity + learning |
| C7 | Spam / rate limits on `/join` + feedback | Hardening |

---

### WS-D — Location Boards to Parity (P1)

Location TEAM and location category boards are the growth surface (every school/campus/county). Today they are roster + calendar only.

| # | Recommendation |
|---|----------------|
| D1 | Mission module at location TEAM (local charge, not statewide copy-paste) |
| D2 | Tasks-light + Resources-light on location category boards |
| D3 | “Develop local leads” snippet embedded on location TEAM |
| D4 | College discoverability: college location index on Leader hub (not only Directory) |
| D5 | Decision: College Lead Organizer segment **or** Chance + category leads (close open Phase 2 decision) |
| D6 | Location Graphic Design — still deferred unless Social Media lead requests it |
| D7 | Coverage heat: schools/counties with zero leads highlighted on segment + reports |

---

### WS-E — Workbench Hardening & Privilege (P0–P1)

| # | Recommendation | Notes |
|---|----------------|-------|
| E1 | Applications + Reports = master (Lead Organizer) gated | Done in this pass |
| E2 | Category leads see **filtered** application slices for their team | V3 follow-on (not full inbox) |
| E3 | Contact → location TEAM deep link | Done in this pass |
| E4 | Directory locations → Open TEAM board when unlocked | Done in this pass |
| E5 | Leader hub college campuses CTA | Done in this pass |
| E6 | Feedback `PAGE_LABELS` for all live routes | Done in this pass |
| E7 | Stale landing “coming next” retired | Done in this pass |
| E8 | Login copy explains personal vs board unlock | Done in this pass |
| E9 | Nav label “Workbench” (was “Leaders”) | Done in this pass |
| E10 | Rate limits, CAPTCHA consideration on public writes | Join + feedback |
| E11 | Soft-delete / archive UX audit on notes, tasks, events | Consistency |
| E12 | Empty / error / loading state pass on every board | Quality bar |

---

### WS-F — Directory Profiles & People OS (P1)

| # | Recommendation |
|---|----------------|
| F1 | Photo crop / aspect guidance (square) before upload |
| F2 | Structured interests (tags) + freeform narrative |
| F3 | “Looking for mentees / mentors” flags (pipeline-adjacent) |
| F4 | Public vs members-only narrative visibility |
| F5 | Profile completeness meter for owners |
| F6 | Export **personal** vCard for self (not bulk voter export — stays forbidden) |
| F7 | Leaders: from roster row → profile + contact + location board in one menu |

---

### WS-G — Calendar & Presence (P1)

| # | Recommendation |
|---|----------------|
| G1 | “Add to my calendar” UX polish on public events |
| G2 | Board-scoped create defaults (location/team prefilled) |
| G3 | RSVP reminders (email) once Notify infrastructure exists |
| G4 | Public event pages shareable with OG image |
| G5 | Attendance rollup on reports (“who showed”) |
| G6 | Still **no** open public event creation |

---

### WS-H — Comms Light (P2 — carefully scoped)

Phase 1 forbids SMS / messaging product. V3 may open a **narrow** lane:

| # | Recommendation | Boundary |
|---|----------------|----------|
| H1 | In-app announcements on a board (leader → members who can access that board) | Not SMS |
| H2 | Email digest opt-in for leads (“weekly gaps + joins”) | Transactional, not blast politics |
| H3 | No general member messaging DM product in V3 | Avoid scope explosion |
| H4 | Talking-points library already in Resources — promote it | Use what we have |

---

### WS-I — Civic Education & Practice Pathways (P2 — product, not LMS)

Aligns with landing “coming next” and mission (education, speaking, responsibility).

| # | Recommendation |
|---|----------------|
| I1 | “Pathways” content surface (not `/training` LMS): modules as Resources + calendar sessions |
| I2 | Surrogate speaking team roster + availability (events team owned) |
| I3 | First-90-days checklist for new members (task templates) |
| I4 | HS / WC / College pathway pages that deep-link into real boards |
| I5 | Keep `/training` and `/events` reserved until pathways prove out |

---

### WS-J — Analytics & Command Clarity (P2)

| # | Recommendation |
|---|----------------|
| J1 | Reports v2: trend lines (joins/week, gaps closed, events held) |
| J2 | Funnel: Join → Accept → Claim → First board visit |
| J3 | Lead health: boards with stale tasks / empty mission |
| J4 | Privacy-safe public stats on landing (opt-in counts only) |
| J5 | Still no voter-file analytics |

---

### WS-K — Mobile Organizer Experience (P1)

| # | Recommendation |
|---|----------------|
| K1 | Gap-fill and accept/decline optimized for phone one-thumb use |
| K2 | Installable PWA (icons already starting) |
| K3 | Camera → profile photo path |
| K4 | Sticky board context (“You are on Pulaski County · Outreach”) |

---

### WS-L — Governance, Docs, QA (continuous)

| # | Recommendation |
|---|----------------|
| L1 | Keep `ROUTE_INVENTORY` / `FEATURE_BOUNDARY_REGISTER` / slice registry in lockstep with code |
| L2 | Playwright smoke: public paths + unlock + one board + join |
| L3 | Accessibility pass (focus, contrast, reduced motion already partly present) |
| L4 | Security review on storage RLS, note visibility, ICS tokens |
| L5 | Decision log entries for College segment + key sunset date |

---

## 5. Explicitly out of V3 (still forbidden / later)

Do **not** pull these in without a new governing decision:

- Open public signup (non-invite)
- SMS / WhatsApp / bulk texting product
- Voter file import/export
- AI chat / auto-messaging
- Full `/admin`, `/messages`, `/analytics` product shells
- Rewriting the canonical mission
- Cross-project database connections

---

## 6. Phased delivery (suggested)

### V3.0 — “One door, one mark” (2–4 weeks)

- [x] Finish identity binding — account login + roles open boards; keys = break-glass (2026-08-01)
- [x] Public site — Netlify visitor password off so landing can be shared
- ~~Brand pack (OG, PWA)~~ — **skipped for now** (per Steve)
- [x] Location TEAM mission module (V3.1 / former #3) — 2026-08-01
- [x] Location category Tasks + Resources (location-scoped) — 2026-08-01
- Notify Chance on join — still deferred (skip queue item #2)
- Privilege + deep-link hardening (partially shipping)
- Docs sync

### V3.1 — “Locations that lead” (3–5 weeks)

- Location Mission / Tasks / Resources
- College index on Leader hub
- Close College segment decision
- Profile photo crop + completeness
- Category-filtered application slices

### V3.2 — “Pathways & presence” (3–5 weeks)

- Pathways content + speaking roster
- Calendar share / RSVP email
- Reports v2 funnel
- Mobile gap-fill polish
- Optional Google OAuth

### V3.3 — “Comms light & command” (optional)

- Board announcements
- Weekly lead digest email
- PWA install prompts
- Expanded audit log

---

## 7. Full recommendation list (checklist)

### Identity & access
1. Account-based board unlock from leadership roles  
2. Keys as break-glass only, with sunset date  
3. Role-aware post-login home  
4. Invite = account + role grant  
5. UI session clarity (profile vs boards)  
6. Password recovery  
7. Optional Google OAuth  
8. Access audit log  

### Brand & trust
9. Mark F everywhere (nav/footer/empty/404/favicon — started)  
10. OG / social image  
11. PWA icons + manifest  
12. Canonical logo README; archive concepts  
13. Email templates with mark  

### Join & onboarding
14. Notify Chance (and optional lead) on application  
15. Applicant status page  
16. Accept → claim invite  
17. Segment attention uses applications queue  
18. Decline reasons  
19. Rate limits / abuse controls  

### Boards & hierarchy
20. Location TEAM mission  
21. Location category tasks + resources  
22. College location index on Leader Board  
23. Decide College Lead Organizer vs status quo  
24. Coverage heat for empty locations  
25. Category-scoped application inbox slices  
26. Keep GD statewide unless explicitly expanded  

### People & profiles
27. Photo crop  
28. Interest tags  
29. Visibility controls on narrative  
30. Completeness meter  
31. Roster quick actions (profile / contact / board)  

### Calendar
32. Share polish + OG on public events  
33. Prefill create from board context  
34. RSVP reminder email  
35. Attendance on reports  

### Comms (narrow)
36. Board announcements (in-app)  
37. Weekly lead email digest  
38. No DM / SMS product in V3  

### Pathways
39. Civic education as Resources + calendar, not LMS  
40. Surrogate speaking roster  
41. First-90-days task templates  
42. HS / WC / College pathway pages  

### Analytics
43. Reports v2 trends  
44. Join → Accept → Claim → Active funnel  
45. Stale-board health  
46. Privacy-safe public momentum stats  

### Mobile & quality
47. Thumb-first gap fill / applications  
48. PWA installability  
49. Camera photo upload  
50. Board context sticky header  
51. a11y + security review  
52. E2E smoke suite  
53. Docs always match code  

---

## 8. Success metrics (V3)

| Metric | Intent |
|--------|--------|
| % of board opens via account session (not key) | Identity consolidation |
| Median time Join → first human contact | Trust loop |
| % location boards with non-empty mission | Depth |
| Profile completeness for active leads | People OS |
| Public calendar ICS subscribers / event RSVPs | Presence |
| Feedback “confusing” rate on login vs unlock | UX clarity |
| Zero unauthorized access to master-only queues | Hardening |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Key → account migration locks Chance out | Break-glass master key retained |
| Email deliverability blocks Notify | Start with Resend/Netlify function + retry |
| Location board parity creates content burden | Templates + copy-from-statewide |
| College segment politics | Decision log; default Chance-owned until named lead |
| Scope creep into messaging/SMS | Boundary register enforcement |

---

## 10. Immediate next build slice (after this plan)

1. Design `person_leadership_roles` → session scope mapping (WS-A spike)  
2. Ship Notify Chance (WS-C1)  
3. Location TEAM mission module (WS-D1)  
4. OG image + PWA manifest (WS-B)  
5. Playwright smoke for public + master paths (WS-L)

---

## 11. Document control

| Field | Value |
|-------|-------|
| Plan id | `AYC-V3-UPGRADE-PLAN` |
| Supersedes | Informal Phase 2 “what’s next” notes |
| Compatible with | Volumes I–VII, Screen Bible, Phase 2 master plan deferred list |
| Mission | Unchanged — canonical file remains authority |

When a V3 slice ships, add a BUILD RETURN under `docs/reports/` and tick the checklist in §7.
