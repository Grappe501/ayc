# Arkansas Youth Coalition
# Volume III
# Technical Architecture

**Version:** 1.0  
**Status:** Governing architecture  
**Platform:** AYC Leadership Workbench  
**Initial deployment:** GitHub to Netlify  
**Primary database:** Netlify-hosted PostgreSQL  
**Initial access model:** Netlify site password with a separate protected write credential  
**Development doctrine:** Simple now, expandable later

**Local workspace (project protocol):** `H:\AYC` — all files on H: only; never C:.  
> Note: An earlier draft suggested `H:\SOSWebsite\ayc\`. The active Cursor workspace and drive protocol use **`H:\AYC`**. Repository name remains `arkansas-youth-coalition-workbench`. Resolve any path wording to `H:\AYC` unless the owner explicitly relocates the project.

---

# 1. Purpose

This volume establishes the technical architecture for the Arkansas Youth Coalition Leadership Workbench.

It governs:

- Application structure
- Technology choices
- Repository organization
- Database access
- Server functions
- Authentication boundaries
- Security controls
- Environment variables
- Deployment
- Testing
- Monitoring
- Documentation
- Future technical expansion

The purpose is not to make Phase 1 technically complex.

The purpose is to ensure that the simplest initial build does not create a dead end.

Phase 1 will contain a small number of pages and functions, but the foundation must support future team boards, individual accounts, communications, events, leadership development, reporting, and statewide coordination.

---

# 2. Technical Doctrine

The AYC Workbench shall follow these rules.

## 2.1 Keep the interface simple

Technical complexity must remain behind the interface.

Leaders should not need to understand databases, permissions, APIs, or deployment architecture to use the system.

## 2.2 Keep the first release small

Phase 1 will not attempt to build the entire future platform.

The first release will provide:

- AYC vision landing page
- Leader contact-entry board
- Read-only leadership directory
- Location registry
- Basic filtering and summaries
- Beta-feedback collection

## 2.3 Build secure boundaries early

Personal contact information must never be stored in frontend source files, static JSON files, browser storage, or publicly accessible repositories.

All database reads and writes must pass through controlled server-side functions.

## 2.4 Design for replacement

Temporary Phase 1 controls, including the shared Netlify password and leader write PIN, must be isolated so they can later be replaced by proper user authentication and role-based access control without rebuilding the contact system.

## 2.5 Avoid premature infrastructure

Do not add queues, microservices, background workers, third-party communication providers, or advanced cloud infrastructure until a demonstrated product need requires them.

## 2.6 Maintain one source of truth

The PostgreSQL database is the authoritative source for contacts, teams, locations, and future operational records.

Display boards must read from the same canonical data used by administration boards.

---

# 3. Phase 1 System Overview

```text
Leadership team member
        |
        v
Netlify password protection
        |
        v
AYC React application
        |
        +-----------------------------+
        |                             |
        v                             v
Leadership Directory          Leader Entry Board
Read-oriented                 Write-authorized
        |                             |
        +-------------+---------------+
                      |
                      v
               Netlify Functions
                      |
                      v
             PostgreSQL Database
```

The browser must never connect directly to the database.

The frontend communicates only with approved server-side endpoints.

---

# 4. Recommended Technology Stack

## 4.1 Frontend

- React
- TypeScript
- Vite
- React Router
- Standards-based CSS
- Accessible HTML
- Lightweight form and validation utilities only when justified

React provides reusable interface components.

TypeScript reduces avoidable errors and creates stronger contracts between the frontend, server functions, and database.

Vite provides a fast and uncomplicated application build.

React Router supports the small Phase 1 route structure while allowing future nested workbench sections.

## 4.2 Backend

- Netlify Functions
- TypeScript
- Shared server-side service modules
- Schema validation for all incoming requests

Netlify Functions will provide the server boundary for:

- Contact creation
- Contact updates
- Contact archiving
- Location creation
- Directory retrieval
- Summary metrics
- Feedback submission
- Write authorization

## 4.3 Database

- PostgreSQL
- Netlify-managed database connection
- Migration-controlled schema
- Drizzle ORM or a similarly lightweight typed database layer

PostgreSQL should remain the long-term canonical database.

The database layer must support:

- Relational integrity
- Unique constraints
- Transactions
- Indexing
- Audit fields
- Migration history
- Future role-based user records

## 4.4 Deployment

- GitHub repository
- Netlify production site
- Netlify deploy previews
- Environment variables configured in Netlify
- Automated build and validation on pull requests or pushes

---

# 5. Repository Strategy

AYC should have its own dedicated repository and deployment boundary.

**Local folder (protocol):**

```text
H:\AYC\
```

**Repository name:**

```text
arkansas-youth-coalition-workbench
```

The AYC repository should not import runtime code directly from unrelated SOSWebsite projects.

Shared ideas may be documented and deliberately reimplemented, but cross-project dependencies should not be introduced casually.

## 5.1 Repository responsibilities

The repository contains:

- Application source code
- Server functions
- Database schema and migrations
- Tests
- Documentation
- Static visual assets
- Build configuration
- Netlify configuration
- Environment-variable examples without secrets

The repository must not contain:

- Real passwords
- Database credentials
- Production contact exports
- Personal information
- API keys
- Unencrypted backups
- Local machine secrets

---

# 6. Recommended Project Structure

```text
ayc/
├── docs/
│   ├── master-build-plan/
│   ├── architecture/
│   ├── product/
│   ├── design/
│   ├── operations/
│   ├── beta/
│   └── decisions/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── brand/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── pages/
│   │   ├── landing/
│   │   ├── leader/
│   │   ├── directory/
│   │   ├── feedback/
│   │   └── not-found/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── forms/
│   │   ├── directory/
│   │   ├── feedback/
│   │   └── ui/
│   │
│   ├── features/
│   │   ├── contacts/
│   │   ├── locations/
│   │   ├── teams/
│   │   ├── directory/
│   │   └── beta-feedback/
│   │
│   ├── services/
│   │   └── api/
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   ├── components.css
│   │   └── utilities.css
│   │
│   ├── types/
│   └── utils/
│
├── netlify/
│   └── functions/
│       ├── contacts.ts
│       ├── contact.ts
│       ├── archive-contact.ts
│       ├── locations.ts
│       ├── directory-summary.ts
│       ├── beta-feedback.ts
│       └── health.ts
│
├── server/
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── seed/
│   │
│   ├── repositories/
│   ├── services/
│   ├── validation/
│   ├── security/
│   ├── logging/
│   └── errors/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── end-to-end/
│
├── scripts/
├── .env.example
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The exact structure may evolve during implementation, but separation between pages, reusable components, feature logic, server logic, and database access is mandatory.

---

# 7. Application Routes

## Phase 1 routes

```text
/
```

AYC vision and workbench landing page.

```text
/leader
```

Protected leader contact-entry board.

```text
/directory
```

Leadership contact display board.

```text
/feedback
```

Beta-feedback form or feedback workspace.

## Reserved future route families

```text
/dashboard
/teams
/teams/:teamSlug
/locations
/locations/:locationCode
/events
/resources
/training
/profile
/admin
/settings
```

Reserved route names do not authorize those features to be built during Phase 1.

---

# 8. Frontend Architecture

## 8.1 Feature-oriented organization

Business logic should be organized by feature rather than placed inside large page files.

For example:

```text
features/contacts/
├── contact.types.ts
├── contact.validation.ts
├── contact.api.ts
├── ContactForm.tsx
├── ContactCard.tsx
└── DuplicateWarning.tsx
```

This allows the same contact behavior to be reused later in:

- Leader board
- Team administration boards
- Event sign-in
- Outreach workflows
- Regional dashboards

## 8.2 Page responsibility

Pages coordinate layouts and features.

Pages should not contain:

- Raw SQL
- Secret values
- Database credentials
- Large amounts of duplicated business logic
- Direct authorization decisions
- Unvalidated server payload handling

## 8.3 Shared interface components

Phase 1 should establish a small reusable component foundation:

- Button
- Link button
- Text field
- Select field
- Radio group
- Checkbox group
- Search field
- Card
- Badge
- Alert
- Modal or dialog
- Empty state
- Loading state
- Page header
- Section header
- Metric card
- Filter control
- Confirmation message

A large third-party component framework is not required for the initial release.

## 8.4 State management

Phase 1 should use:

- Local component state
- URL search parameters for directory filters
- Small shared React context only where genuinely necessary
- Server data fetched through a controlled API service

A global state-management library should not be added unless the application demonstrates a real need.

## 8.5 URL-based directory filters

Directory search and filter state should be represented in the URL when practical.

Example:

```text
/directory?team=organizer&position=lead&locationType=college
```

This allows views to be bookmarked, refreshed, and shared without losing their state.

---

# 9. Server Architecture

## 9.1 Layered server structure

Each server request should pass through clear layers:

```text
Netlify Function
      |
      v
Request validation
      |
      v
Authorization check
      |
      v
Service
      |
      v
Repository
      |
      v
Database
```

## 9.2 Function responsibilities

A Netlify Function should:

- Accept the request
- Parse input
- Validate input
- Confirm authorization
- Call a service
- Return a consistent response
- Record safe operational errors

A function should not contain the entire business workflow in one file.

## 9.3 Service responsibilities

Services contain business rules, including:

- Duplicate contact evaluation
- Three-letter location-code generation
- Contact status transitions
- Primary-team enforcement
- Archive behavior
- Directory summary calculations

## 9.4 Repository responsibilities

Repositories contain database operations.

Examples:

- `createContact`
- `updateContact`
- `findContactByEmail`
- `findContactByPhone`
- `searchContacts`
- `createLocation`
- `findLocationByCode`
- `archiveContact`

This separation makes it easier to test business behavior without coupling every test to a deployed function.

---

# 10. API Standards

## 10.1 Phase 1 endpoints

```text
GET    /.netlify/functions/contacts
POST   /.netlify/functions/contacts
GET    /.netlify/functions/contact?id={contactId}
PATCH  /.netlify/functions/contact?id={contactId}
POST   /.netlify/functions/archive-contact
GET    /.netlify/functions/locations
POST   /.netlify/functions/locations
GET    /.netlify/functions/directory-summary
POST   /.netlify/functions/beta-feedback
GET    /.netlify/functions/health
```

The final implementation may use Netlify function routing patterns, but the public contracts must remain documented.

## 10.2 Standard success response

```json
{
  "ok": true,
  "data": {},
  "meta": {}
}
```

## 10.3 Standard error response

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields.",
    "fields": {}
  }
}
```

## 10.4 Error codes

Initial error codes should include:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
DUPLICATE_CONTACT
LOCATION_CODE_CONFLICT
DATABASE_ERROR
RATE_LIMITED
INTERNAL_ERROR
```

Messages shown to users should remain helpful and nontechnical.

Detailed internal errors must never be returned to the browser.

---

# 11. Input Validation

All incoming data must be validated on the server, even when the frontend already validates it.

Frontend validation improves usability.

Server validation protects the system.

## 11.1 Contact validation

Required:

- First name
- Last name
- Location
- Primary team
- Position

At least one direct contact method should ordinarily be supplied:

- Email
- Phone

If leadership intentionally allows records without either method, the system should require an explicit status such as `PROSPECTIVE` and present a warning.

## 11.2 Normalization

Before duplicate checking or storage:

- Trim whitespace
- Normalize email addresses to lowercase
- Normalize phone numbers to digits and country code
- Normalize location names for comparison
- Normalize location codes to uppercase
- Reject unsupported status, team, and position values

## 11.3 Never trust browser-supplied authority

The browser must not be allowed to assign itself:

- Administrator status
- Special permissions
- Audit identity
- Internal record ownership
- Protected workflow approval

---

# 12. Phase 1 Access Model

## 12.1 Site access

Netlify password protection will guard the complete beta site.

Steve will configure this through Netlify.

This creates one shared outer access boundary for the initial leadership team.

## 12.2 Write access

The leader-entry board requires a second authorization control.

Recommended Phase 1 mechanism:

- A leader write PIN or passphrase
- Stored only in a Netlify environment variable
- Submitted to a server function
- Validated server-side
- Exchanged for a short-lived signed write session where practical

The raw write credential should not be stored permanently in local storage.

## 12.3 Read access

People who pass the Netlify site password may view the directory during the controlled beta.

Sensitive contact fields should be minimized in summary views and revealed only when needed.

## 12.4 Important limitation

The Phase 1 system will not know which specific person entered through the shared Netlify password.

Therefore:

- It cannot provide true individual accountability.
- It cannot offer person-specific permissions.
- It should not be treated as the final security model.
- Access must remain limited to trusted leadership participants.

## 12.5 Future replacement

The Phase 1 write guard must later be replaceable with:

- Individual user authentication
- Role-based access control
- Session management
- Team-scoped permissions
- Named audit records
- Account revocation
- Multi-factor authentication where appropriate

The contact and location schemas must not depend on the temporary password model.

---

# 13. Future Role-Based Access Control

The future access model should support at least:

```text
SYSTEM_ADMIN
AYC_DIRECTOR
LEADERSHIP_BOARD
TEAM_LEAD
LOCATION_LEAD
VOLUNTEER
VIEW_ONLY
```

Possible authority boundaries:

## System administrator

Technical and platform administration.

## AYC director

Statewide operational authority.

## Leadership board

Broad organizational visibility and approved management tools.

## Team lead

Management authority limited to assigned teams.

## Location lead

Management authority limited to assigned school, college, or county.

## Volunteer

Access to assigned work, training, events, and personal profile.

## View only

Read access to approved workbench information.

These roles are planning placeholders until Volume V defines the formal product-permission model.

---

# 14. Database Connection Rules

## 14.1 Server only

Database credentials must only be available to server-side execution.

The frontend bundle must never contain:

```text
DATABASE_URL
database passwords
private tokens
administrative credentials
```

## 14.2 Connection management

The database client should be initialized in a server-safe reusable module.

Connections must be compatible with serverless execution and avoid opening uncontrolled new connections on every operation.

## 14.3 Transactions

Transactions should be used when one action modifies multiple related records.

Example:

Creating a contact with team assignments should either complete entirely or fail entirely.

## 14.4 Migrations

All schema changes must use numbered or timestamped migrations.

Never alter production tables manually without recording the same change in the migration system.

---

# 15. Environment Variables

## 15.1 Required initial variables

```text
DATABASE_URL
AYC_LEADER_WRITE_SECRET
AYC_ENVIRONMENT
AYC_SITE_NAME
```

Potential optional values:

```text
AYC_ALLOWED_ORIGIN
AYC_CONTACT_REVEAL_MODE
AYC_FEEDBACK_NOTIFICATION_EMAIL
LOG_LEVEL
```

## 15.2 Environment rules

- `.env` files containing secrets must be ignored by Git.
- `.env.example` documents variable names without real values.
- Production secrets are configured through Netlify.
- Deploy previews should use nonproduction credentials where possible.
- Secrets must never appear in screenshots, logs, documentation, or build-return reports.

## 15.3 Environment modes

```text
development
preview
production
```

The interface should visibly identify nonproduction environments when useful to prevent accidental confusion during beta testing.

---

# 16. Privacy Architecture

The system will store personal information belonging to students, young adults, volunteers, and leaders.

Privacy must be treated as a foundational requirement.

## 16.1 Data minimization

Collect only information that has a defined organizational purpose.

Phase 1 should not collect:

- Social Security numbers
- Dates of birth
- Government identification
- Street addresses
- Sensitive demographic profiles
- Private academic records
- Unnecessary personal notes
- Passwords belonging to other services

## 16.2 Youth information

The system may eventually include high-school students and people under eighteen.

Phase 1 should avoid collecting unnecessary age-specific information until youth privacy, consent, retention, and access requirements have been formally reviewed.

The system must not claim legal compliance merely because technical safeguards exist.

## 16.3 Contact display

Directory views should favor:

- Name
- General location
- Team
- Position
- Status

Full email addresses and phone numbers should not dominate list views.

## 16.4 Notes

A general-purpose private notes field creates privacy and misuse risks.

If notes are included in Phase 1, they should be:

- Optional
- Restricted in length
- Accompanied by guidance
- Excluded from general directory responses
- Never used to record rumors, sensitive personal details, or subjective character judgments

---

# 17. Security Controls

Phase 1 should include proportional safeguards without pretending to offer enterprise-grade identity security.

## Required controls

- Netlify site password
- Separate server-validated write authorization
- Server-side input validation
- Parameterized database queries
- Restricted CORS policy
- Secure response headers
- No secrets in frontend code
- No personal information in logs
- Rate limiting or basic abuse protection for write endpoints
- Archiving instead of casual deletion
- Error redaction
- Dependency auditing
- Database constraints
- Controlled deploy access

## Destructive actions

Phase 1 should not permanently delete contacts through the normal user interface.

Use archiving.

Permanent deletion, when later required, should be restricted and logged.

---

# 18. Audit Architecture

Even before individual user accounts exist, the system should record basic operational changes.

Initial audit events:

```text
CONTACT_CREATED
CONTACT_UPDATED
CONTACT_ARCHIVED
CONTACT_RESTORED
LOCATION_CREATED
LOCATION_UPDATED
BETA_FEEDBACK_SUBMITTED
```

Each event should record:

```text
event ID
event type
entity type
entity ID
actor label
safe change summary
timestamp
request or correlation ID
```

Until named accounts exist, the actor may be:

```text
PHASE_1_LEADER
SYSTEM
```

The audit log must not duplicate complete phone numbers, email addresses, secrets, or sensitive notes.

---

# 19. Error Handling

## User-facing behavior

Errors should explain:

- What could not be completed
- Whether user input was preserved
- What action the user should take next

Example:

> We could not save this contact. Your information is still on the screen. Please review the highlighted fields and try again.

## Internal behavior

Internal errors should capture:

- Safe error code
- Function name
- Request ID
- Timestamp
- Environment
- Non-sensitive technical context

Internal errors must not capture:

- Write secrets
- Database credentials
- Full contact records
- Personal notes
- Raw authorization headers

---

# 20. Logging

Use structured logging rather than scattered unformatted console messages.

Suggested levels:

```text
debug
info
warn
error
```

Production should avoid unnecessary debug output.

Each server request should receive a correlation or request ID that can be used to connect safe log entries.

---

# 21. Health and Readiness

A basic health endpoint should confirm that the application can execute.

It should not reveal:

- Database credentials
- Environment values
- Schema details
- Internal infrastructure

Possible response:

```json
{
  "ok": true,
  "service": "ayc-workbench",
  "environment": "production"
}
```

A deeper database-readiness check may be available only to authorized operators.

---

# 22. Testing Strategy

## 22.1 Unit tests

Test isolated logic:

- Location-code suggestions
- Phone normalization
- Email normalization
- Duplicate scoring
- Contact validation
- Status transitions
- Team assignment rules

## 22.2 Integration tests

Test server and database behavior:

- Create contact
- Reject invalid contact
- Detect duplicate contact
- Create location
- Reject duplicate location code
- Update contact
- Archive contact
- Filter directory
- Calculate summaries

## 22.3 End-to-end tests

Test important user journeys:

1. Enter protected site.
2. Open leader board.
3. Authenticate for write access.
4. Create a new location.
5. Create a contact.
6. Confirm the contact appears in the directory.
7. Search and filter for the contact.
8. Edit the contact.
9. Archive the contact.
10. Confirm archived records are excluded from the default active directory.

## 22.4 Accessibility testing

At minimum:

- Keyboard-only navigation
- Form-label validation
- Visible focus indicators
- Screen-reader naming
- Contrast review
- Reduced-motion behavior
- Mobile touch-target review

## 22.5 Device testing

Primary test sizes:

- Small phone
- Large phone
- iPad portrait
- iPad landscape
- Standard laptop
- Large desktop

---

# 23. Build Validation

Before deployment, the project must pass:

```text
TypeScript typecheck
application build
unit tests
integration tests where configured
lint or code-quality checks
database migration validation
secret scanning
accessibility smoke tests
```

Recommended package scripts:

```text
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run test:integration
npm run test:e2e
npm run validate
```

`npm run validate` should become the canonical combined quality gate.

---

# 24. GitHub Workflow

## 24.1 Main branch

The default branch should represent deployable code.

Recommended branch:

```text
main
```

## 24.2 Feature branches

Meaningful changes should use feature branches:

```text
feature/phase-1-landing
feature/contact-entry
feature/directory-filters
fix/mobile-form-layout
```

During an operator-directed accelerated build, direct commits may be permitted by the governing build protocol, but validation must still run before production deployment.

## 24.3 Commit standards

Commit messages should describe the delivered capability.

Examples:

```text
feat: add phase one vision landing page
feat: create contact entry workflow
fix: preserve contact form after server error
docs: define location code governance
```

## 24.4 Pull requests

When used, pull requests should include:

- Purpose
- Files or systems affected
- Database impact
- Security impact
- Testing completed
- Screenshots for visual changes
- Rollback considerations

---

# 25. Netlify Deployment Architecture

## 25.1 Production

Production deploys from the approved GitHub branch.

## 25.2 Deploy previews

Deploy previews should be used for leadership review before major visual or workflow changes reach production.

Deploy previews must not casually connect to production personal data.

## 25.3 Netlify configuration

`netlify.toml` should define:

- Build command
- Publish directory
- Functions directory
- Redirects
- Security headers
- SPA routing fallback
- Context-specific settings where appropriate

## 25.4 Password protection

Steve will configure Netlify password protection through Netlify.

The password must not be committed to the repository.

## 25.5 Database migrations

Database migrations should be run through a deliberate controlled process.

A frontend deployment must not silently apply destructive migrations.

---

# 26. Data Backup and Recovery

Before the contact directory becomes operationally important, the project must establish:

- Scheduled database backups
- Backup retention
- Restore instructions
- Export capability for authorized operators
- Recovery testing

A backup is not considered reliable until restoration has been tested.

Exports containing personal information must not be committed to Git or stored in public cloud folders without appropriate protection.

---

# 27. Performance Standards

Phase 1 should remain lightweight.

Targets:

- Fast first page load
- Minimal JavaScript
- Compressed images
- Responsive interactions
- Paginated or bounded directory requests
- Indexed search fields
- No unnecessary polling
- No large UI framework unless justified

Directory search should use server filtering once the record count grows beyond what is sensible to load at once.

---

# 28. Accessibility Standards

The technical implementation should target WCAG 2.2 AA principles where practical.

Required foundations:

- Semantic HTML
- Proper headings
- Associated form labels
- Keyboard access
- Visible focus
- Meaningful link text
- Accessible validation
- Sufficient contrast
- Reduced-motion support
- Screen-reader announcements for save and error states

Accessibility regressions are defects, not optional polish.

---

# 29. Analytics and Measurement

Phase 1 should use minimal, privacy-conscious product measurement.

Useful measurements may include:

- Contact creation success rate
- Form abandonment
- Directory search use
- Filter use
- Device category
- Page-level errors
- Beta-feedback submissions

Do not introduce invasive user tracking.

Personal contact data must never be sent to analytics providers as labels, URLs, event properties, or page content.

---

# 30. Beta Feedback Architecture

Beta feedback is part of the product, not an external afterthought.

Feedback records should support:

- Category
- Page or workflow
- Description
- Severity or urgency
- Optional reporter name
- Status
- Resolution note
- Created timestamp
- Resolved timestamp

Initial categories:

```text
CONFUSING
MISSING_FEATURE
MOBILE_PROBLEM
ERROR
IDEA
PRIVACY_CONCERN
```

Beta feedback should eventually become the primary evidence used to prioritize the next build.

---

# 31. Feature Flags

Phase 1 may use simple server-controlled feature flags for incomplete or selectively tested capabilities.

Examples:

```text
AYC_FEATURE_BETA_FEEDBACK
AYC_FEATURE_CONTACT_REVEAL
AYC_FEATURE_LOCATION_CREATION
```

Feature flags must not be treated as security controls.

A hidden button is not authorization.

---

# 32. Dependency Policy

Every package added to the project must have a clear purpose.

Before adding a dependency, determine:

- What problem it solves
- Whether the browser platform or current stack already solves it
- Maintenance activity
- Security history
- Bundle impact
- License compatibility
- Whether it creates vendor lock-in

Avoid dependencies for trivial utilities that can be safely implemented in a few well-tested lines.

---

# 33. Technical Decision Records

Major technical choices should be recorded in architecture decision records.

Recommended path:

```text
docs/decisions/
```

Examples:

```text
ADR-001-frontend-stack.md
ADR-002-netlify-database.md
ADR-003-phase-one-access-model.md
ADR-004-location-code-namespaces.md
ADR-005-archive-instead-of-delete.md
```

Each decision record should contain:

- Context
- Decision
- Alternatives considered
- Consequences
- Review trigger

---

# 34. Documentation Standards

Every meaningful feature should document:

- Purpose
- User workflow
- Technical structure
- Data used
- Permissions
- Validation
- Error behavior
- Testing
- Known limitations
- Future expansion points

Documentation must evolve with implementation.

A feature is not complete when its code and governing documentation disagree.

---

# 35. Cursor Development Rules

Cursor must follow these requirements during implementation.

## Before coding

- Read the Master Build Plan.
- Read all applicable architecture volumes.
- Inspect the current repository.
- Identify the active approved phase and slice.
- Confirm allowed paths.
- Confirm forbidden paths.
- Review existing implementation before creating duplicate structures.

## During coding

- Stay within the active slice.
- Avoid unrelated refactors.
- Keep secrets out of code and output.
- Preserve working behavior.
- Use typed contracts.
- Add validation and error handling.
- Maintain mobile and accessibility standards.
- Update documentation with material architectural changes.

## Before closing a slice

- Run required validation.
- Report exact files changed.
- Report database changes.
- Report security implications.
- Report remaining limitations.
- Provide local viewing instructions for visual work.
- Provide rollback guidance where appropriate.
- Commit and push only according to the approved repository protocol.

Cursor must not independently expand the product roadmap.

---

# 36. Phase 1 Technical Boundaries

Phase 1 is authorized to build:

- Landing page
- Leader-entry board
- Leadership directory
- Contacts
- Locations
- Teams and positions
- Search and filtering
- Summary metrics
- Beta feedback
- Basic audit events
- Basic health monitoring

Phase 1 is not authorized to build:

- Individual accounts
- OAuth
- Public membership registration
- Email sending
- Text messaging
- Automated outreach
- Event-management system
- Volunteer-hour tracking
- AI features
- File uploads
- Payment processing
- School data imports
- Voter-file integration
- Public contact exposure
- Advanced analytics
- Cross-project database connections

These require later approved phases.

---

# 37. Evolution Path

## Phase 1

Shared protected beta and contact foundation.

## Phase 2

Team-specific boards and operational workflows.

## Phase 3

Individual authentication and role-based permissions.

The exact ordering of Phase 2 and Phase 3 may change if beta testing demonstrates that individual accounts are required sooner.

## Phase 4

Events, assignments, attendance, and follow-up.

## Phase 5

Communications integration.

## Phase 6

Leadership development and training.

## Phase 7

Location, regional, and statewide dashboards.

## Phase 8

AI-assisted tools with human approval and privacy controls.

Each phase must build on the same canonical people, location, team, and permissions foundation.

---

# 38. Phase 1 Technical Completion Standard

The technical foundation is ready for beta when:

- The application builds successfully.
- Production deploys through GitHub and Netlify.
- Netlify password protection is active.
- Leader writes require a second server-validated authorization.
- The browser has no direct database credentials.
- Contacts persist in PostgreSQL.
- Locations persist in PostgreSQL.
- Duplicate controls operate.
- Contacts can be updated and archived.
- Directory search and filters work.
- Personal information is not exposed in logs.
- Database migrations are documented.
- Required validation passes.
- Mobile and tablet workflows are usable.
- Accessibility smoke testing passes.
- Beta feedback can be recorded.
- Recovery and export procedures are documented.
- Deferred functionality has not entered the release.

---

# 39. Governing Technical Principle

The AYC Workbench must be easy for leaders to use, difficult to misuse, and straightforward for future developers to understand.

The technical foundation should remain almost invisible to the leadership team.

They should experience only:

- Clarity
- Speed
- Confidence
- Safety
- Momentum

That is the standard against which every technical decision will be judged.

---

**Next:** Volume IV — complete data architecture (people, locations, codes, teams, roles, statuses, audit, duplicates, feedback, relationships, constraints, migrations, expansion).
