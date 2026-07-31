# Arkansas Youth Coalition
# Volume VII
# Development Governance and Cursor Build Protocol

**Version:** 1.0  
**Status:** Governing development protocol  
**Platform:** AYC Leadership Workbench  
**Primary repository:** Dedicated AYC repository  
**Initial deployment:** GitHub to Netlify  
**Development operator:** Steve Grappe  
**Implementation assistant:** Cursor  
**Architecture and build guidance:** ChatGPT  
**Initial release:** Phase 1 Leadership Workbench Beta

**Local workspace (project protocol):** `H:\AYC` — all files on H: only; never C:.  
> Note: Draft recommended `H:\SOSWebsite\ayc\`. Active Cursor workspace and drive protocol use **`H:\AYC`**. Repository name remains `arkansas-youth-coalition-workbench`.

---

# 1. Purpose

This volume establishes the development governance system for the Arkansas Youth Coalition Workbench.

It governs:

- Repository creation
- Local workspace rules
- Cursor operating instructions
- Documentation requirements
- Build phases
- Build slices
- Allowed and forbidden work
- Human approval gates
- Database changes
- Security controls
- Testing requirements
- Git procedures
- Netlify deployment
- Beta review
- Build-return reports
- Rollback procedures
- Decision records
- Future feature admission
- Architecture-drift prevention

The purpose of this protocol is to ensure that the AYC Workbench is built deliberately, consistently, and safely.

Cursor is responsible for implementing approved work.

Cursor is not responsible for independently redefining the product, expanding the roadmap, or making governance decisions.

---

# 2. Canonical AYC Mission Statement

The following mission statement is governing AYC language:

> To unite young people from all walks of life, through inclusive outreach, fostering Youth (16 - 24) engagement in politics as a force for change. By expanding through voting initiatives, social gatherings, and direct interactions with policymakers, we bridge the gap between youth voices and political action. We seek to amplify this generation’s voice within the Natural State, ensuring their priorities and ideas drive the decisions that shape our worlds today’s and tomorrows.

This statement must be preserved as the official mission unless AYC leadership formally approves a revision.

Canonical copy also stored in: `02-AYC-VISION-CANONICAL.md`

## 2.1 Mission-statement implementation rules

Cursor may:

- Format the mission for visual presentation.
- Break the mission into readable paragraphs.
- Emphasize selected phrases through typography.
- Use the mission in metadata or page descriptions when appropriate.
- Create a shortened display excerpt when a governing copy document authorizes it.

Cursor may not:

- Rewrite the mission.
- Correct the wording without approval.
- Substitute a different mission statement.
- Remove references to youth ages 16–24.
- Change the political-engagement purpose.
- Change the Natural State reference.
- Present temporary copy as the approved mission.

Any proposed editorial refinement must be placed in a separate recommendation document and must not replace the canonical language without approval.

---

# 3. Governing Document Hierarchy

The AYC project is controlled by the following documents:

```text
Volume I
Master Build Plan

Volume II
Design System and User Experience Standards

Volume III
Technical Architecture

Volume IV
Data Architecture

Volume V
Product Architecture and Operational Workbench

Volume VI
UI/UX Screen Bible

Volume VII
Development Governance and Cursor Build Protocol
```

Future volumes may be added, but the governing hierarchy should remain clear.

## 3.1 Order of authority

When documents conflict, use this order:

1. Latest explicit instruction from Steve
2. Approved active build-slice specification
3. Approved architecture decision record
4. Latest governing volume
5. Existing implementation
6. Cursor assumptions

The existing implementation does not override governing documentation merely because it already exists.

## 3.2 Conflict behavior

When Cursor discovers a material conflict, it must:

1. Stop the conflicting portion of work.
2. Continue any unaffected approved work.
3. Document the conflict.
4. Identify the files and rules involved.
5. Recommend a resolution.
6. Avoid inventing a new rule silently.

Routine implementation choices that do not change product scope may proceed without interruption.

---

# 4. Project Identity

## Product name

```text
Arkansas Youth Coalition Leadership Workbench
```

## Short name

```text
AYC Workbench
```

## Organization

```text
Arkansas Youth Coalition
```

## Initial product purpose

```text
A protected leadership workspace for building and maintaining the AYC statewide contact network.
```

## Initial beta audience

```text
AYC leadership team
```

## Initial youth range

```text
Ages 16–24
```

---

# 5. Repository and Workspace Rules

AYC should use a dedicated repository and deployment boundary.

**Local path (protocol):**

```text
H:\AYC\
```

**Repository name:**

```text
arkansas-youth-coalition-workbench
```

**Production branch:**

```text
main
```

## 5.1 Repository isolation

The AYC repository must remain operationally separate from:

- RedDirt
- Kelly Grappe campaign systems
- Stand Up Arkansas operational databases
- Arkansas Civic University
- AJAX
- ContactListSOS
- VoteMatch
- CountyWorkbench
- Other SOSWebsite applications

Concepts, design ideas, and approved assets may be reused deliberately.

Runtime code, databases, environment variables, or authentication systems must not be connected across projects without explicit approval.

## 5.2 Local-drive rules

All project files should remain under the approved AYC folder (`H:\AYC`).

Cursor must not:

- Create a second hidden AYC project elsewhere.
- Use an unrelated project as a scratch workspace.
- Scatter governing documents across other repositories.
- Copy production personal information into temporary folders.
- Create untracked database exports outside approved paths.

Temporary build files generated by normal development tools should remain within the project’s normal dependency and build structure.

## 5.3 Repository contents

The repository may contain:

- Application source
- Netlify Functions
- Database migrations
- Tests
- Documentation
- Static assets
- Configuration
- Seed data without real personal information
- Development scripts
- Build reports

The repository must not contain:

- Passwords
- Production environment values
- Database credentials
- Personal contact exports
- Real youth data used as test fixtures
- API keys
- Netlify access tokens
- Unencrypted backups
- Private leadership notes

---

# 6. Canonical Documentation Structure

Recommended documentation structure:

```text
docs/
├── master-build-plan/
│   ├── VOLUME_I_MASTER_BUILD_PLAN.md
│   ├── VOLUME_II_DESIGN_SYSTEM.md
│   ├── VOLUME_III_TECHNICAL_ARCHITECTURE.md
│   ├── VOLUME_IV_DATA_ARCHITECTURE.md
│   ├── VOLUME_V_PRODUCT_ARCHITECTURE.md
│   ├── VOLUME_VI_UI_UX_SCREEN_BIBLE.md
│   └── VOLUME_VII_DEVELOPMENT_GOVERNANCE.md
│
├── decisions/
├── phases/
├── slices/
├── beta/
├── security/
├── deployment/
├── operations/
├── reports/
└── archive/
```

> Note: Current intake files use numbered prefixes (`03-…`, `04-…`, etc.). Either naming scheme is valid; do not duplicate content under both names without a single index.

## 6.1 Documentation rule

No material feature is complete until:

- The implementation exists.
- Tests exist where required.
- Governing documentation reflects the implementation.
- Known limitations are documented.
- The build-return report is complete.

## 6.2 Documentation drift

Documentation drift occurs when:

- Code implements an undocumented feature.
- Documentation describes functionality that does not exist.
- Schema and data documents disagree.
- Route inventories are outdated.
- Security controls differ from the governing protocol.
- A phase is marked complete without required proof.

Cursor must treat documentation drift as a build defect.

---

# 7. Development Roles

## 7.1 Steve

Steve is the final human authority for:

- Product direction
- Scope approval
- Mission language
- Build-phase approval
- Sensitive data decisions
- Production launch
- Major architecture changes
- Authentication changes
- Database migrations with destructive impact
- Public-facing publication
- Future communication tools
- Leadership-team permissions

## 7.2 ChatGPT

ChatGPT serves as:

- System architect
- Product planner
- Governance writer
- Build-slice designer
- Cursor instruction writer
- Build-return reviewer
- Architecture-drift evaluator
- Next-slice recommender

## 7.3 Cursor

Cursor serves as:

- Repository auditor
- Implementer
- Tester
- Documentation updater
- Build validator
- Git operator when authorized
- Deployment operator when authorized
- Build-return reporter

Cursor may not substitute its own product strategy for the approved plan.

## 7.4 AYC leadership team

The leadership team serves as:

- Beta testers
- Workflow validators
- Feedback providers
- Product-priority contributors
- Operational subject-matter experts

Beta feedback informs future builds but does not automatically authorize implementation.

---

# 8. Development Operating Model

The project should be built through controlled phases and slices.

## Phase

A major product stage.

Example:

```text
AYC-PHASE-1-LEADERSHIP-WORKBENCH
```

## Slice

A bounded implementation package within a phase.

Example:

```text
AYC-PHASE-1A-FOUNDATION-1.0
```

## Pass

A focused improvement inside an approved slice.

Example:

```text
Mobile polish pass
Accessibility pass
Error-state pass
```

No build request should become an uncontrolled collection of unrelated changes.

---

# 9. Build Slice Naming

Use this format:

```text
AYC-[PHASE]-[CAPABILITY]-[VERSION]
```

Examples:

```text
AYC-PHASE-0-GOVERNANCE-FOUNDATION-1.0
AYC-PHASE-1A-APPLICATION-SHELL-1.0
AYC-PHASE-1B-VISION-LANDING-1.0
AYC-PHASE-1C-DATA-FOUNDATION-1.0
AYC-PHASE-1D-LEADER-BOARD-1.0
AYC-PHASE-1E-DIRECTORY-1.0
AYC-PHASE-1F-BETA-READINESS-1.0
```

Versions may advance:

```text
1.0
1.1
1.2
```

A new version should represent a meaningful, documented change.

---

# 10. Slice Specification Requirements

Every Cursor build instruction should include:

- Slice name
- Purpose
- Current project state
- Governing documents
- Allowed paths
- Forbidden paths
- Required deliverables
- Required routes
- Data impact
- Security requirements
- UX requirements
- Testing requirements
- Documentation updates
- Validation commands
- Git instructions
- Build-return format
- Stop conditions

Cursor must read the full slice before editing files.

---

# 11. Before Cursor Writes Code

Cursor must complete an orientation pass.

## Required orientation actions

1. Confirm current working directory.
2. Confirm repository root.
3. Read the README.
4. Read all governing volumes.
5. Read active phase and slice documents.
6. Inspect package configuration.
7. Inspect Netlify configuration.
8. Inspect current routes.
9. Inspect database schema and migrations.
10. Inspect environment-variable examples.
11. Inspect tests and scripts.
12. Check Git status.
13. Identify uncommitted work.
14. Confirm active branch.
15. Identify current build and validation commands.
16. Record baseline findings.

## Baseline report

Before major implementation, Cursor should report:

```text
Repository root
Current branch
Current commit
Working-tree status
Detected stack
Existing routes
Existing database state
Existing Netlify state
Validation commands
Conflicts or risks
```

Cursor must not erase or overwrite unknown work.

---

# 12. Allowed Phase 1 Build Scope

Phase 1 may include:

- AYC mission and vision landing page
- Shared application shell
- Protected Leader Board
- Contact creation
- Contact editing
- Contact archiving
- Contact restoration
- Location creation
- Three-letter code generation
- Duplicate detection
- Leadership directory
- People view
- Team view
- Location view
- Search
- Filters
- Sorting
- Summary metrics
- Beta feedback
- Basic audit records
- Health endpoint
- Mobile-responsive behavior
- Accessibility
- Loading, empty, success, and error states
- Netlify deployment
- PostgreSQL persistence
- Documentation and testing

---

# 13. Forbidden Phase 1 Expansion

Cursor must not build the following without a new approved slice:

- Individual user accounts
- Google OAuth
- Social login
- Public member registration
- Email campaigns
- SMS sending
- Automated messaging
- Team chat
- Event management
- Attendance
- Volunteer hours
- Training portal
- AI assistant
- File uploads
- Public directory
- Data imports
- Contact exports
- Voter-file integration
- Donor records
- Payment processing
- Political profiling
- Advanced analytics
- School-record integration
- Cross-project database access
- External CRM synchronization
- Automatic data enrichment
- Geolocation tracking
- Location tracking
- Hidden surveillance analytics

Deferred functionality must not be added simply because it appears easy.

---

# 14. Change-Control Categories

## 14.1 Routine changes

Cursor may implement within an approved slice:

- Component creation
- Styling
- Responsive improvements
- Tests
- Validation
- Error handling
- Documentation
- Safe refactoring inside slice boundaries
- Accessibility corrections

## 14.2 Material changes

Require explicit approval or a governing slice:

- New routes
- New database tables
- New roles
- New authentication providers
- New personal-data fields
- New third-party services
- New communication channels
- Public access changes
- New export capability
- New integration
- New user category
- New administrative authority

## 14.3 Critical changes

Require a hard stop and approval:

- Destructive migration
- Production-data deletion
- Secret exposure
- Production password changes
- Permission expansion
- Public release of personal information
- Live email or SMS sending
- Collection of sensitive youth information
- Cross-project database connection
- Authentication bypass
- Security-control removal

---

# 15. Human Approval Gates

## Gate 0: Architecture approval

Required before implementation begins.

Evidence:

- Volumes I–VII complete
- Phase 1 scope approved
- Mission statement locked

## Gate 1: Repository foundation approval

Required before product implementation.

Evidence:

- Dedicated repository
- Correct local path
- README
- Documentation library
- Package scripts
- Netlify configuration
- Environment example
- Initial validation

## Gate 2: Visual foundation approval

Required before database-heavy feature expansion.

Evidence:

- Application shell
- Landing page
- Mobile view
- Tablet view
- Desktop view
- Approved mission presentation
- Navigation

## Gate 3: Data-foundation approval

Required before live contact entry.

Evidence:

- Database connection
- Migrations
- People schema
- Contact methods
- Locations
- Teams
- Team assignments
- Audit records
- Duplicate tests

## Gate 4: Leader Board approval

Required before leadership-team use.

Evidence:

- Write-access control
- Contact form
- Location creation
- Duplicate handling
- Edit
- Archive
- Restore
- Error states
- Mobile operation

## Gate 5: Directory approval

Required before directory beta.

Evidence:

- Search
- Filters
- Sorting
- People view
- Teams view
- Locations view
- Privacy behavior
- Contact masking
- Mobile cards
- Desktop table or rows

## Gate 6: Beta-readiness approval

Required before leadership-team testing.

Evidence:

- Accessibility review
- Security checklist
- Responsive QA
- Backup plan
- Feedback form
- Test data removed or identified
- Production password active
- Production database confirmed
- Build validation passed

## Gate 7: Phase 1 acceptance

Required before Phase 2 planning.

Evidence:

- Leadership beta completed
- Feedback reviewed
- Blocking defects closed
- Phase 1 report complete
- Next-phase priorities selected from evidence

---

# 16. Routine Approval Policy

Routine closure questions should not stall the build.

Within an approved slice, Cursor may proceed with ordinary implementation decisions when:

- The choice does not expand scope.
- The choice does not change personal-data collection.
- The choice does not weaken security.
- The choice does not create a new service dependency.
- The choice is reversible.
- The choice follows governing architecture.

Cursor should document the choice in the build return.

Cursor must stop only for genuine boundary conflicts, sensitive-data concerns, destructive actions, or unapproved product expansion.

---

# 17. Database Governance

## 17.1 Migration-only rule

All schema changes must be represented by migration files.

Manual production changes are prohibited unless:

- Emergency intervention is required.
- Steve approves it.
- The same change is immediately captured in migration history.
- A recovery record is created.

## 17.2 Additive-first rule

Prefer:

- New nullable columns
- New tables
- New indexes
- Backward-compatible values
- Staged transitions

Avoid:

- Immediate column removal
- Renaming without compatibility
- Type changes that risk data loss
- Table replacement
- Unreviewed production backfills

## 17.3 Destructive migration gate

Before a destructive migration:

1. Document why it is necessary.
2. Identify affected records.
3. Confirm backup.
4. Create migration plan.
5. Create rollback or recovery plan.
6. Test on nonproduction data.
7. Obtain approval.
8. Run verification after migration.

## 17.4 Seed-data rule

Seed data may include:

- Five canonical teams
- Approved reference values
- Clearly marked fictional test records
- Development locations

Seed data must not include real youth contact information unless explicitly approved for a protected environment.

---

# 18. Personal Data Governance

AYC contact information is not ordinary demo content.

## Required protections

- Personal information remains in PostgreSQL.
- Personal information is never hard-coded.
- Personal information is never committed to Git.
- Personal information is not included in screenshots without masking.
- Logs exclude full email and phone values.
- Error reports exclude full contact payloads.
- Deploy previews do not casually use production personal data.
- Exports remain disabled during Phase 1.
- General directory responses exclude unnecessary fields.

## Youth-data rule

Because AYC serves people ages 16–24, the project must use heightened care with high-school participants and minors.

Phase 1 must not collect:

- Date of birth
- Street address
- Parent information
- School records
- Grades
- Medical information
- Disciplinary information
- Government identification
- Sensitive personal narratives

Any expansion of youth-data collection requires a dedicated privacy and legal review slice.

---

# 19. Authentication Governance

## Phase 1 outer access

Netlify password protection.

Configured manually by Steve in Netlify.

## Phase 1 write access

Separate server-validated leader credential.

Stored as an environment variable.

## Prohibited behavior

Cursor must not:

- Hard-code the access code.
- Store it in frontend source.
- Log it.
- Return it through an API.
- Save it in local storage indefinitely.
- Include it in documentation.
- Print it in build reports.

## Future authentication

Individual authentication will require a dedicated approved phase.

It must not be added opportunistically during another slice.

---

# 20. Environment-Variable Governance

Required example file:

```text
.env.example
```

The file documents names only.

Potential Phase 1 variables:

```text
DATABASE_URL=
AYC_LEADER_WRITE_SECRET=
AYC_ENVIRONMENT=
AYC_SITE_NAME=
AYC_ALLOWED_ORIGIN=
LOG_LEVEL=
```

## Environment rules

- Production secrets are configured in Netlify.
- Local secrets remain in ignored files.
- Preview environments should not automatically share production credentials.
- Cursor must never print secret values.
- Build-return reports may say whether a variable is present, but not reveal it.
- Missing variables should produce safe diagnostic messages.

---

# 21. Dependency Governance

Before adding a package, Cursor must determine:

- What problem it solves
- Whether existing code already solves it
- Bundle impact
- Maintenance status
- Security history
- TypeScript support
- License
- Long-term necessity

## Prohibited dependency behavior

Do not add:

- Large UI frameworks merely for basic components
- Multiple libraries that solve the same problem
- Abandoned packages
- Packages requiring unnecessary personal-data transfer
- Analytics SDKs without approval
- Authentication SDKs before the authentication phase
- Messaging SDKs before communications approval

Every new dependency should be listed in the build return.

---

# 22. Coding Standards

## Required characteristics

- TypeScript strictness where practical
- Clear function names
- Small focused modules
- Typed API contracts
- Typed database records
- Server-side validation
- Reusable form components
- Accessible HTML
- Predictable error handling
- No duplicated business rules
- No direct SQL inside interface components
- No secret access inside frontend code

## Avoid

- Giant page components
- Unbounded utility files
- `any` without justification
- Silent error swallowing
- Copy-pasted validation
- Hard-coded team lists scattered across files
- Hard-coded route strings everywhere
- Business logic embedded in CSS or markup
- Unexplained magic values

---

# 23. UX Governance

All implementation must conform to Volume II and Volume VI.

## Required Phase 1 principles

- Mobile first
- iPad polished
- Desktop stable
- One clear primary action per screen
- Plain language
- No dead-end screens
- No blank loading states
- No unexplained errors
- No disabled future-feature graveyard
- No forced slang
- No childlike treatment of youth leaders
- No desktop-only workflows

## Content rule

The approved AYC mission statement must appear on the landing page in a dignified, readable presentation.

Cursor must not substitute generic civic-engagement language.

---

# 24. Accessibility Governance

Accessibility is part of completion.

Required:

- Semantic landmarks
- Correct heading order
- Keyboard navigation
- Visible focus
- Form labels
- Error association
- Dialog focus control
- Screen-reader status messages
- Color-independent meaning
- Reduced-motion support
- Accessible mobile menus
- Minimum practical touch targets
- Sufficient color contrast

Accessibility defects should be reported like functional defects.

---

# 25. Testing Governance

## 25.1 Unit tests

Required for:

- Normalization
- Validation
- Code generation
- Duplicate scoring
- Status transitions
- Team-assignment rules
- Authorization helpers

## 25.2 Integration tests

Required for:

- Contact creation
- Contact update
- Contact archive
- Contact restore
- Location creation
- Duplicate prevention
- Directory filtering
- Feedback submission
- Audit-event creation

## 25.3 End-to-end tests

Required for critical journeys:

- Unlock Leader Board
- Create location
- Create contact
- Find contact
- Edit contact
- Archive contact
- Restore contact
- Submit feedback

## 25.4 Manual QA

Required for:

- Small phone
- Large phone
- iPad portrait
- iPad landscape
- Laptop
- Desktop
- Keyboard-only use
- Reduced motion
- Long school names
- Empty database
- Slow network
- Failed database response

---

# 26. Validation Commands

The repository should expose clear scripts.

Recommended:

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

`npm run validate` should become the principal quality gate.

Recommended composition:

```text
typecheck
lint
unit tests
integration tests
build
```

End-to-end tests may run separately when deployment or browser dependencies require it.

Cursor must report every validation result.

---

# 27. Git Governance

## 27.1 Commit discipline

Commits should represent meaningful completed units.

Examples:

```text
docs: add AYC governing architecture volumes
feat: establish AYC application shell
feat: add contact data foundation
feat: build leader contact workflow
feat: add leadership directory views
fix: preserve contact form after failed save
```

## 27.2 Forbidden Git behavior

Cursor must not:

- Force-push without explicit authorization.
- Rewrite shared history casually.
- Delete branches containing unknown work.
- Commit secrets.
- Commit personal exports.
- Commit broken code knowingly.
- Hide failed validation.
- Use vague commit messages such as `updates`.

## 27.3 Working-tree protection

Before editing:

- Inspect Git status.
- Identify existing changes.
- Avoid overwriting user work.
- Report unrelated modifications.

## 27.4 Commit and push cadence

The project may commit and push after each approved slice or substantial pass.

A commit should occur only after required validation succeeds, unless the commit is explicitly marked as documentation-only or recovery work.

---

# 28. Netlify Deployment Governance

## 28.1 Production deployment

Production should deploy from the approved GitHub branch.

## 28.2 Deploy previews

Use deploy previews for:

- Visual review
- Leadership review
- Mobile review
- Workflow review
- Major page changes

Deploy previews should avoid production personal data.

## 28.3 Production-password rule

Steve configures and controls the Netlify site password.

Cursor may document where to configure it but must not place the password in code.

## 28.4 Deployment verification

After deployment, Cursor or the operator should verify:

- Landing page loads.
- Protected access works.
- SPA routes load directly.
- Netlify Functions respond.
- Database connection works.
- Environment variables are present.
- Contact creation works in the intended environment.
- Directory reads work.
- Error pages do not reveal internals.
- Mobile layout remains intact.

## 28.5 Failed deployment

When deployment fails:

1. Preserve the failed logs.
2. Identify the failure category.
3. Do not weaken security to force success.
4. Fix the root cause.
5. Re-run local validation.
6. Redeploy.
7. Document the resolution.

---

# 29. Build-Return Standard

Every Cursor slice must end with a structured build return.

Required format:

```text
BUILD RETURN

Slice:
Status:
Branch:
Starting commit:
Ending commit:

1. Summary

2. Governing documents reviewed

3. Files created

4. Files changed

5. Routes added or changed

6. Database impact

7. API or Netlify Function impact

8. Security and privacy impact

9. UX and accessibility impact

10. Tests added

11. Validation results

12. Local viewing instructions

13. Deployment status

14. Known limitations

15. Boundary confirmation

16. Recommended next slice
```

## 29.1 Status values

```text
SUCCESS
PARTIAL
BLOCKED
FAILED
```

Cursor must not report success when required validation failed.

## 29.2 Boundary confirmation

Every return must explicitly confirm:

```text
No secrets committed.
No production personal data committed.
No unauthorized Phase 2 features added.
No cross-project database connections added.
No live email or SMS capability added.
No destructive migration performed without approval.
```

---

# 30. Visual Build Returns

Whenever a slice changes visible pages, Cursor must provide:

- Local development command
- Exact printed local URL
- Recommended first route to inspect
- Additional routes to inspect
- Mobile inspection guidance
- Tablet inspection guidance
- Screenshots when available and appropriate

Example:

```text
Run:
npm run dev

Open the URL printed by Vite.

Review first:
/

Then review:
/leader
/directory
/feedback
```

Cursor must not assume the port number in advance if the development server may select another port.

---

# 31. Rollback Governance

Every material slice should identify rollback behavior.

## Code rollback

- Revert the relevant commit.
- Re-run validation.
- Redeploy the stable commit.

## Database rollback

Prefer forward-fix migrations.

When rollback is safe:

- Use a documented reverse migration.
- Confirm backup.
- Verify affected data.

## Feature rollback

Use controlled flags when a partially deployed feature must be hidden without removing the underlying data.

Feature flags must not replace authorization controls.

---

# 32. Incident Response

Examples of incidents:

- Secret exposed
- Personal information committed
- Unauthorized access
- Production contact deletion
- Incorrect public exposure
- Database corruption
- Authentication bypass
- Unexpected bulk record creation

## Immediate response

1. Stop deployment or access where appropriate.
2. Preserve evidence.
3. Rotate affected credentials.
4. Remove exposed access.
5. Identify affected records.
6. Notify Steve.
7. Document the incident.
8. Restore from known-good state when needed.
9. Create a prevention action.

Cursor must never conceal a security or data incident.

---

# 33. Beta Governance

Beta testing is a controlled product-development stage.

## 33.1 Beta purpose

The Phase 1 beta should determine:

- Whether the mission and vision are clear
- Whether leaders understand the five teams
- Whether contact entry is easy
- Whether location coding is understandable
- Whether contacts can be found quickly
- Whether mobile use is comfortable
- Whether leaders trust the directory
- What single next capability would create the most value

## 33.2 Beta participants

Initial beta participants should be trusted AYC leaders with access to the protected site.

## 33.3 Beta data

Use:

- Approved real leadership contacts
- Clearly labeled test records
- Minimal data necessary for testing

Do not create fake records that could be mistaken for real people in production.

## 33.4 Beta feedback categories

```text
Confusing
Missing Feature
Mobile Problem
Error
Idea
Privacy Concern
Accessibility Problem
```

## 33.5 Beta issue priorities

### Blocking

Prevents core use or creates security/privacy risk.

### High

Makes a central workflow difficult or unreliable.

### Medium

Creates repeated friction but has a workaround.

### Low

Polish or minor preference.

---

# 34. Beta Acceptance Questions

Before ending Phase 1, ask leadership:

1. Does the landing page accurately explain AYC?
2. Does the mission statement feel central?
3. Can a leader add a contact without instructions?
4. Does the location-code system make sense?
5. Can a person be found in under ten seconds?
6. Is the directory useful on a phone?
7. Is any information being collected unnecessarily?
8. Is any essential information missing?
9. Which part feels confusing?
10. Which next board or function would save the most time?

Answers should be documented in a Phase 1 beta report.

---

# 35. Feature Admission Process

A requested feature enters the roadmap through:

```text
Request
↓
Evidence
↓
Problem definition
↓
Architecture review
↓
Priority decision
↓
Approved slice
↓
Implementation
↓
Beta
```

## Required admission questions

- Who needs it?
- What problem does it solve?
- How often does the problem occur?
- What happens without it?
- Does an existing function already solve it?
- What data does it require?
- What permissions does it require?
- What security risk does it introduce?
- What simpler version could be tested first?
- How will success be measured?

A popular idea is not automatically a high-priority feature.

---

# 36. Architecture Decision Records

Create an ADR for major choices.

Recommended initial ADRs:

```text
ADR-001-DEDICATED-AYC-REPOSITORY.md
ADR-002-REACT-VITE-NETLIFY-STACK.md
ADR-003-NETLIFY-POSTGRES-DATABASE.md
ADR-004-PHASE-1-SHARED-ACCESS-MODEL.md
ADR-005-CANONICAL-PEOPLE-RECORD.md
ADR-006-LOCATION-CODE-NAMESPACES.md
ADR-007-ARCHIVE-INSTEAD-OF-DELETE.md
ADR-008-PHASE-1-CONTACT-PRIVACY.md
```

Each ADR should include:

- Status
- Context
- Decision
- Alternatives
- Consequences
- Review trigger

---

# 37. Phase 0 Build Sequence

## AYC-PHASE-0A-REPOSITORY-FOUNDATION-1.0

Deliver:

- Repository
- Package foundation
- README
- Gitignore
- Netlify configuration
- Environment example
- Documentation folders
- Baseline scripts

## AYC-PHASE-0B-GOVERNING-DOCUMENT-LIBRARY-1.0

Deliver:

- Volumes I–VII
- Mission statement lock
- Route inventory
- Phase inventory
- ADR index
- Decision log
- Glossary

## AYC-PHASE-0C-DEVELOPMENT-QUALITY-GATES-1.0

Deliver:

- Typecheck
- Lint
- Test framework
- Validation script
- Build-return template
- Security checklist
- Deployment checklist

## AYC-PHASE-0D-TECHNICAL-SCAFFOLD-1.0

Deliver:

- React/Vite app
- Router
- Shared shell
- Placeholder approved routes
- Netlify Functions structure
- Database client shell
- No production feature logic yet

---

# 38. Phase 1 Build Sequence

## AYC-PHASE-1A-APPLICATION-SHELL-1.0

Deliver:

- Header
- Navigation
- Footer
- Mobile menu
- Beta label
- Feedback control
- Responsive layout
- Error boundary
- Not-found page

## AYC-PHASE-1B-VISION-LANDING-1.0

Deliver:

- Hero
- Canonical mission statement
- Vision sections
- Five teams
- Leadership-workbench entry cards
- Beta explanation
- Responsive visual polish

## AYC-PHASE-1C-DATA-FOUNDATION-1.0

Deliver:

- Database connection
- Migrations
- Teams seed
- People
- Contact methods
- Locations
- Affiliations
- Team assignments
- Feedback
- Audit events

## AYC-PHASE-1D-LEADER-ACCESS-AND-CONTACT-CREATION-1.0

Deliver:

- Write-access gate
- Contact form
- Location picker
- Location creation
- Code generation
- Duplicate checks
- Transactional save
- Success and error states

## AYC-PHASE-1E-CONTACT-MANAGEMENT-1.0

Deliver:

- Contact detail
- Edit
- Archive
- Restore
- Audit trail writing
- Duplicate recheck on contact changes

## AYC-PHASE-1F-LEADERSHIP-DIRECTORY-1.0

Deliver:

- Summary metrics
- Search
- Filters
- Sorting
- People view
- Teams view
- Locations view
- Detail page
- Contact masking

## AYC-PHASE-1G-BETA-FEEDBACK-1.0

Deliver:

- Feedback form
- Page-context capture
- Reference code
- Success state
- Feedback persistence

## AYC-PHASE-1H-BETA-READINESS-1.0

Deliver:

- Accessibility pass
- Mobile pass
- iPad pass
- Security review
- Privacy review
- Backup documentation
- Deployment validation
- Beta test script
- Phase 1 launch checklist

---

# 39. Definition of Done

A slice is done only when:

- Scope is complete.
- Required files exist.
- Required routes work.
- Data changes are migrated.
- Validation passes.
- Security requirements are met.
- Accessibility requirements are met.
- Mobile use is verified.
- Documentation is updated.
- Build return is complete.
- Known limitations are disclosed.
- No forbidden expansion occurred.

A visually impressive page with broken data behavior is not done.

A functional database workflow with poor mobile usability is not done.

A successful build with missing documentation is not done.

---

# 40. Phase 1 Definition of Complete

Phase 1 is complete when the leadership team can:

- Enter the protected site
- Understand the AYC mission
- Understand the five teams
- Unlock the Leader Board
- Add a contact
- Add a location
- Use the three-letter code system
- Review duplicate warnings
- Edit a contact
- Archive and restore a contact
- Search the directory
- Filter by team, location, position, and status
- View teams
- View represented locations
- Submit beta feedback
- Use the complete workflow on a phone and iPad

The platform must also:

- Persist data in PostgreSQL
- Protect writes server-side
- Keep secrets outside the repository
- Avoid unnecessary youth data
- Pass required validation
- Deploy through GitHub and Netlify
- Preserve a documented recovery path

---

# 41. Stop Conditions

Cursor must stop the affected work and report when:

- The requested change conflicts with governing scope.
- A production secret appears in source.
- Personal data is found in Git history.
- A destructive migration lacks approval.
- Production data could be lost.
- Authentication would be weakened.
- A public route could expose contact information.
- Live communication capability is being introduced without approval.
- Cross-project data access is required.
- A legal or privacy judgment is being assumed.
- Existing uncommitted user work would be overwritten.
- Required environment configuration cannot be safely inferred.

Cursor should continue unaffected work whenever possible.

---

# 42. Progress Reporting

After each completed slice, the project should update a phase-progress report.

Recommended Phase 1 progress layers:

```text
Governance Foundation
Repository Foundation
Visual Design System
Application Shell
Vision Landing Page
Database Foundation
Leader Access
Contact Creation
Contact Management
Location Registry
Duplicate Detection
Leadership Directory
Team View
Location View
Beta Feedback
Mobile Readiness
Tablet Readiness
Accessibility
Security
Privacy Readiness
Deployment Readiness
Overall Phase 1 Readiness
```

Each layer may be represented as a percentage with a brief evidence note.

Percentages must be evidence-based rather than decorative.

---

# 43. Recommended Progress Bar Format

```text
Governance Foundation       ██████████ 100%
Repository Foundation       ███████░░░  70%
Application Shell           ███░░░░░░░  30%
Vision Landing Page         ██░░░░░░░░  20%
Database Foundation         ░░░░░░░░░░   0%
Leader Access               ░░░░░░░░░░   0%
Contact Creation            ░░░░░░░░░░   0%
Leadership Directory        ░░░░░░░░░░   0%
Beta Readiness              ░░░░░░░░░░   0%
Overall Phase 1 Readiness   ██░░░░░░░░  20%
```

Every percentage should be accompanied by the work that justifies it.

---

# 44. Future Phase Governance

Future phases must receive their own:

- Product scope
- Data impact review
- Permission review
- UX screen specification
- Security assessment
- Beta plan
- Build sequence
- Acceptance gate

No future phase inherits authorization merely because it appears in the long-term roadmap.

Particular care is required for:

- Individual accounts
- High-school student information
- Communications
- Events involving minors
- Volunteer-hour verification
- Public profiles
- AI tools
- Location-based reporting
- Political-engagement tracking

---

# 45. Cursor Opening Instruction Standard

Every future Cursor script should begin with language substantially equivalent to:

```text
You are operating inside the dedicated Arkansas Youth Coalition Workbench repository.

Before making changes:

1. Confirm the repository root and current branch.
2. Read the governing AYC volumes.
3. Read the active phase and slice documents.
4. Inspect Git status and preserve existing work.
5. Confirm allowed and forbidden paths.
6. Stay strictly within the approved slice.
7. Do not expose secrets or personal information.
8. Do not introduce deferred functionality.
9. Run all required validation before closing.
10. Return the required structured BUILD RETURN.
```

---

# 46. Cursor Closing Instruction Standard

Every Cursor script should end with language substantially equivalent to:

```text
Do not stop after writing code.

Complete the full approved slice.

Run required validation.

Fix failures that are within scope.

Update documentation.

Provide exact local viewing instructions for visual work.

Report all files changed, database impact, security impact, limitations, and next-slice recommendation.

Do not report SUCCESS unless required validation passes.
```

---

# 47. Governing Development Principle

The AYC Workbench should grow through disciplined learning.

The organization will not attempt to predict every future need and build it all at once.

Instead, it will:

```text
Design carefully
Build narrowly
Test honestly
Listen closely
Improve deliberately
Expand responsibly
```

Cursor’s job is to implement the approved system faithfully.

The leadership team’s job is to test whether it serves their real work.

Steve’s job is to protect the mission, approve the direction, and decide when the system is ready to grow.

The development process is successful when each beta release is small enough to understand, strong enough to use, and flexible enough to become the foundation for what comes next.

---

**Next:** Volume VIII — Phase 1 Master Implementation Plan (exact build sequence, dependencies, acceptance tests, comprehensive first Cursor script).

**Gate 0 note:** Volumes I–VII and mission lock satisfy architecture approval evidence. Implementation still awaits Volume VIII (or explicit owner authorization to begin Phase 0 slices).
