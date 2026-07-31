# AYC Leadership Workbench — Phase 1 System Design

**Status:** Canonical Phase 1 product design (intake)  
**Working product name:** AYC Leadership Workbench  
**Internal framing:** A shared home for the young Arkansans building the organization.

This is **not** the public AYC website yet. It is the protected leadership workspace from which the organization will grow.

---

## Doctrine

Build this as a small, polished, expandable operating system — not as a miniature version of the final workbench.

Phase 1 does only three things exceptionally well:

1. Explain what AYC is building.
2. Let the designated AYC leader create and manage a statewide contact list.
3. Give the leadership team a clean, useful directory they can view and filter.

Every additional function comes from leadership-team beta testing.

**Product doctrine**

- Build the smallest useful version.
- Put it in leaders’ hands.
- Watch how they actually use it.
- Build the next function from demonstrated need.

---

## 1. Phase 1 Product

### Routes

```
/
├── Landing Page
├── /leader
│   └── Leader Entry Board
└── /directory
    └── Leadership Contact Board
```

The entire site sits behind the **Netlify shared-password** screen (set up online by the owner).

Netlify basic password protection gives everyone one shared credential. It is appropriate for a small controlled beta, but it does **not** identify individual users or give different people different permissions.

### Extra write safeguard

Because the leader board can write personal information into the database:

```
Netlify shared password
        ↓
Access to the workbench
        ↓
Leader Entry Board asks for a separate leader PIN
        ↓
Server validates PIN before accepting writes
```

This remains simple but prevents every beta tester with the general password from adding, editing, or archiving contacts.

---

## 2. The First Landing Page

Visually strong without being crowded.

### A. Hero

**ARKANSAS YOUTH COALITION**

Arkansas belongs to the people who are ready to build its future.

A statewide network of young Arkansans organizing, leading, registering voters, creating community, and building lasting civic power.

**Primary actions**

- Enter the Workbench
- View the Leadership Directory

### B. The AYC Vision

This section contains the approved **Stand Up AYC vision** from the prior project build.

> **CONTENT HOLD:** Paste approved Stand Up AYC vision language here before landing-page copy is finalized. Do not reconstruct from memory.

**Recommended structure (placeholder until vision is pasted)**

**WHY WE EXIST**  
The challenge facing young Arkansans.

**WHAT WE ARE BUILDING**  
A statewide, youth-led network rooted in schools, colleges and local communities.

**HOW WE BUILD IT**  
Organizing. Voter registration. Social media. Events. Community outreach. Leadership development.

### C. The Five Teams

| Team | Initial purpose |
|------|-----------------|
| Organizer | Build teams, relationships and local structure |
| Voter Registration | Help young Arkansans register and participate |
| Social Media | Tell the story and grow the network |
| Events | Create gatherings, trainings and civic experiences |
| Outreach | Build relationships with schools, communities and organizations |

These cards initially explain the teams. Later, each becomes an operational dashboard.

### D. The Leadership Principle

A short section explaining that AYC will be built **with** the leadership team rather than delivered as a finished product:

> This workbench will grow with the coalition. AYC leaders will test each phase, identify what they need, and help determine what gets built next.

### E. Workbench Navigation

Two large entry cards:

- **LEADER ENTRY BOARD** — Create and manage contact records.
- **LEADERSHIP DIRECTORY** — See the people, places and teams building AYC.

---

## 3. Leader Entry Board

**Route:** `/leader`

### Phase 1 authority

One designated person enters all records.

Do **not** initially include complex permissions, workflows, bulk imports, or team-specific dashboards.

Eventually each team leader will have an admin board that feeds the leader board. Phase 1 is the template for that pattern: one writer board + one display board.

### Contact form

#### Personal information

- First name *
- Last name *
- Email address
- Mobile/text number
- Preferred contact method: Text | Email | Either | Unknown

#### Location

Leader first selects:

- College
- High School
- County / Non-Student

Second field then changes:

- College name
- High school name
- County

Leader can select an existing location or create a new one. When creating a new location, the system generates a suggested three-letter code and allows approve/override.

#### Team

Phase 1 teams:

- Organizer
- Voter Registration
- Social Media
- Events
- Outreach

Phase 1 support:

- Primary team *
- Additional teams

(Eventually a person may belong to more than one team; primary + additional avoids early DB redesign.)

#### Position

- Lead
- Volunteer

Stored as expandable role enum: `LEAD` | `VOLUNTEER`  
Future values may include: `COORDINATOR`, `ADVISER`, `MENTOR`, `STAFF`, `PARTNER`

#### Record status

- Active (default)
- Prospective
- Inactive

Status must exist from the beginning so people who leave are not mixed with current leaders and are not deleted.

#### Form actions

- Save Contact
- Save and Add Another
- Cancel

After saving:

```
Contact added successfully.

Jordan Smith
UCA · Organizer · Volunteer
```

Then: Edit | Archive | Add another person | View in directory

#### Duplicate prevention

Before insert, server checks:

1. Exact email match
2. Normalized phone-number match
3. First name + last name + location match

A likely duplicate creates a **warning**, not a silent second record.

---

## 4. Leadership Directory Board

**Route:** `/directory`

Primarily for viewing.

### Top summary (four metrics)

- Total People
- Active Leaders
- Locations Represented
- Teams Represented

### Search

One prominent search box: name, school, county, code, or team.

### Filters

- Location Type
- Location
- Team
- Position
- Status

### View controls

- People
- Teams
- Locations

#### People view

Clean card / mobile row:

```
JORDAN SMITH

UCA · University of Central Arkansas
Organizer
Volunteer

Email
Text
```

#### Teams view

```
Organizer — 12
Voter Registration — 8
Social Media — 6
Events — 5
Outreach — 9
```

Selecting a team shows its members.

#### Locations view

```
UCA — University of Central Arkansas
8 members

PUL — Pulaski County
6 members

LRX — Little Rock Central High School
4 members
```

### Privacy treatment (shared-password beta)

- Email: `j••••@example.com`
- Phone: `•••-•••-1234`
- **Reveal Contact Information** control shows full values to workbench visitors

Does not replace future role-based security; reduces accidental exposure during demos / screen sharing.

---

## 5. Three-Letter Location System

Codes live inside a **location namespace** to avoid college/high-school/county collisions.

### Stored structure

- Location type: `COLLEGE` | `HIGH_SCHOOL` | `COUNTY`
- Code: three letters (e.g. `UCA`)
- Composite identifier: `COL-UCA`
- Display code: `UCA` (what users normally see)

### Prefixes

| Prefix | Category |
|--------|----------|
| COL | College |
| HSC | High School |
| CTY | County |

### Examples

```
COL-UCA  COL-ASU  COL-UAF
HSC-LRC  HSC-JAX  HSC-PAH
CTY-PUL  CTY-WAS  CTY-BEN
```

### Code-generation rules

**Counties** — first three recognizable letters, with manual exceptions for collisions  
(e.g. Pulaski → PUL, Washington → WAS, Benton → BEN, Faulkner → FAU, Craighead → CRA, White → WHI)

**Colleges** — established abbreviations when available  
(e.g. UCA, ASU, UAF, ATU, UAP)

**High schools** — recognizable code from school or community name  
(e.g. LRC, JAX, PBH, NLR)

### Generate-as-we-go workflow

1. Leader searches existing locations.
2. No match → Create location.
3. System proposes a code.
4. System checks unused within that location type.
5. Leader approves or edits.
6. Location available for all future records.

Do **not** preload every Arkansas college and high school in Phase 1. Registry grows organically; can later reconcile against an official statewide dataset.

---

## 6. Database Design

Netlify Database = serverless PostgreSQL. Writes only through server-side functions. Browser never receives DB credentials.

### Table: `contacts`

| Column | Notes |
|--------|-------|
| id | |
| first_name | |
| last_name | |
| email | |
| phone | |
| preferred_contact_method | |
| location_id | |
| primary_team | |
| position | |
| status | |
| notes | |
| created_at | |
| updated_at | |
| archived_at | |
| created_by | Phase 1: `AYC_LEADER` |
| updated_by | Phase 1: `AYC_LEADER` |

### Table: `locations`

| Column | Notes |
|--------|-------|
| id | |
| location_type | |
| code | |
| composite_code | |
| name | |
| city | |
| county | |
| active | |
| created_at | |
| updated_at | |

**Constraints**

- Unique: `location_type + code`
- Unique: `location_type + normalized name`

### Table: `contact_teams`

Prevents primary-team design from becoming a dead end.

| Column | Notes |
|--------|-------|
| id | |
| contact_id | |
| team | |
| is_primary | |
| created_at | |

### Table: `activity_log`

Audit trail for young people’s contact information. No visible admin page in Phase 1.

| Column | Notes |
|--------|-------|
| id | |
| action | |
| entity_type | |
| entity_id | |
| actor | |
| summary | |
| created_at | |

**Initial actions:** `CONTACT_CREATED`, `CONTACT_UPDATED`, `CONTACT_ARCHIVED`, `LOCATION_CREATED`

---

## 7. Technical Architecture

### Stack

| Layer | Choice |
|-------|--------|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Netlify Functions (TypeScript) |
| Database | Netlify Database / PostgreSQL |
| ORM / client | Drizzle ORM or native Netlify Database client |
| Hosting | GitHub → Netlify |
| Protection | Netlify shared site password + leader write PIN (`AYC_LEADER_WRITE_KEY`) |

### API routes

```
GET    /.netlify/functions/contacts
POST   /.netlify/functions/contacts
GET    /.netlify/functions/contacts/:id
PATCH  /.netlify/functions/contacts/:id
POST   /.netlify/functions/contacts/:id/archive

GET    /.netlify/functions/locations
POST   /.netlify/functions/locations

GET    /.netlify/functions/directory-summary
```

### Environment variables

- `DATABASE_URL`
- `AYC_LEADER_WRITE_KEY`
- `AYC_SITE_NAME`
- `AYC_ENVIRONMENT`

No secrets committed to GitHub. All project files on **H:\AYC** only — never C:.

---

## 8. Visual and UX Direction

**Feel:** Youth-led, confident, modern, Arkansas-rooted, energetic, organized, inviting.  
**Not:** Corporate, childish, partisan-template generic.

### Design approach

- Strong typography; large editorial headlines; generous spacing
- Minimal navigation: Vision · Teams · Directory · Leader Entry
- Mobile first — forms, cards, filters, directory on phone
- Color: deep midnight background, warm cream content, electric blue/cyan accent, Arkansas red sparingly, fresh green success (prefer existing AYC brand colors if established)
- Motion: light only — hero entrance, card hover/touch, save confirmation, filter transitions

---

## 9. Explicitly Deferred (Phase 1 Will Not Include)

- Individual user accounts
- Full role-based permissions
- Team-specific administration boards
- Text-message sending
- Email campaigns
- Event management
- Tasks / attendance / volunteer hours
- Voter-registration tracking
- AI recommendations
- File uploads / bulk imports
- Public membership applications
- School or county dashboards
- Analytics beyond simple directory counts

Database and routes leave room; none of these belong in the first beta.

---

## 10. Beta Testing Loop

Persistent site control: **Send Beta Feedback**

### Phase 1 feedback categories

- Something is confusing
- Something is missing
- Something is difficult on mobile
- I found an error
- I have an idea

### Initial beta questions

1. Can the leader enter five people without instruction?
2. Can leaders find someone in under ten seconds?
3. Are the teams and positions understandable?
4. Does the location-code process make sense?
5. What information do leaders immediately ask to add?
6. Which new board would save the leadership team the most time?

---

## 11. Phase 1 Completion Standard

- [ ] Protected site deploys through GitHub and Netlify
- [ ] Landing page clearly communicates approved AYC vision
- [ ] Five teams are presented
- [ ] Leader can create a contact
- [ ] Leader can create a new location and three-letter code
- [ ] Duplicate contacts are flagged
- [ ] Contacts can be edited and archived
- [ ] Directory displays active contacts
- [ ] Search and filters work
- [ ] Team and location summaries work
- [ ] Interface works on phone, tablet and desktop
- [ ] Database writes occur only through server-side functions
- [ ] Secrets remain outside the repository
- [ ] Beta feedback can be submitted
- [ ] No deferred Phase 2 functions have slipped into the build

---

## Recommended Build Sequence

| Phase ID | Focus |
|----------|--------|
| `AYC-PHASE-0-GOVERNANCE-AND-FOUNDATION-1.0` | Repository, architecture, rules, environment and build documentation |
| `AYC-PHASE-1A-VISION-LANDING-1.0` | Visual system, landing page, vision and team presentation |
| `AYC-PHASE-1B-CONTACT-DATA-FOUNDATION-1.0` | Database schema, migrations, location registry and server functions |
| `AYC-PHASE-1C-LEADER-ENTRY-BOARD-1.0` | Contact creation, editing, duplicate detection and archiving |
| `AYC-PHASE-1D-LEADERSHIP-DIRECTORY-1.0` | Directory, search, filters and summary views |
| `AYC-PHASE-1E-BETA-READINESS-1.0` | Mobile QA, privacy review, feedback intake and beta checklist |

---

## Next plan deliverables (from design author)

1. AYC Master Build Plan outline
2. Comprehensive Phase 0 Cursor construction script
3. Paste approved Stand Up AYC vision so it becomes canonical before landing-page copy is finalized
