# Arkansas Youth Coalition
# Volume VI
# UI/UX Screen Bible

**Version:** 1.0  
**Status:** Governing screen specification  
**Platform:** AYC Leadership Workbench  
**Release scope:** Phase 1 beta  
**Primary devices:** Mobile phone and iPad  
**Secondary device:** Desktop and laptop  
**Access model:** Netlify-protected leadership beta

---

# 1. Purpose

This volume defines the exact user-facing structure of the Phase 1 Arkansas Youth Coalition Leadership Workbench.

It translates the Master Build Plan, Design System, Technical Architecture, Data Architecture, and Product Architecture into concrete screens and interactions.

This document governs:

- Routes
- Page layouts
- Navigation
- Forms
- Cards
- Buttons
- Tables and directory views
- Search and filters
- Empty states
- Loading states
- Success states
- Error states
- Mobile behavior
- Tablet behavior
- Desktop behavior
- Contact creation
- Contact editing
- Location creation
- Duplicate review
- Archiving
- Contact-detail display
- Beta feedback

Cursor must not invent unapproved screens, actions, fields, or navigation paths during Phase 1.

---

# 2. Phase 1 Experience Goal

The Phase 1 Workbench must feel complete even though it is intentionally small.

A leader should be able to:

1. Understand the AYC vision.
2. Enter the protected Workbench.
3. Add a person.
4. Add a school, college, or county when needed.
5. Review possible duplicates.
6. See the person in the directory.
7. Search and filter the directory.
8. Edit or archive a record when authorized.
9. Submit beta feedback.

The application should feel purposeful rather than unfinished.

Deferred features should not appear as broken links or unusable placeholders.

---

# 3. Phase 1 Route Map

Approved routes:

```text
/
├── /leader
├── /leader/contacts/new
├── /leader/contacts/:personId
├── /directory
├── /directory/:personId
├── /feedback
└── /not-found
```

Optional route aliases may redirect:

```text
/workbench     -> /leader
/people        -> /directory
/add-contact   -> /leader/contacts/new
```

There should be no Phase 1 routes for:

```text
/admin
/events
/training
/messages
/analytics
/regions
/profile
/settings
```

These routes should not be exposed until their corresponding product phases are approved.

---

# 4. Shared Application Shell

Every protected page uses the same application shell.

## 4.1 Shell structure

```text
Top bar
Main navigation
Page content
Persistent beta-feedback control
Footer
```

## 4.2 Top bar

The top bar contains:

- AYC mark or wordmark
- Product name
- Environment label when not in production
- Mobile menu control
- Optional session indicator

Recommended product label:

```text
AYC Leadership Workbench
```

The top bar should remain compact.

It should not contain a crowded collection of icons.

## 4.3 Primary navigation

Phase 1 navigation:

```text
Home
Directory
Leader Board
Feedback
```

Desktop and tablet:

- Horizontal navigation when space allows
- Active-page indicator
- Clear text labels
- No icon-only navigation

Mobile:

- Compact menu button
- Accessible slide-down or slide-over panel
- Current page remains visible
- Menu closes after selection

## 4.4 Persistent beta-feedback control

Every page includes a visible but unobtrusive control:

```text
Send Beta Feedback
```

Desktop:

- Fixed near the lower-right edge or within the footer area

Mobile:

- Compact sticky button above the safe-area boundary
- Must not obstruct primary action buttons

Selecting it opens `/feedback` and carries the current page path as context.

## 4.5 Footer

Phase 1 footer content:

```text
Arkansas Youth Coalition
Leadership Workbench Beta
Built with the leadership team
```

Optional links:

```text
Privacy Notice
Beta Feedback
Return Home
```

The footer should remain minimal.

---

# 5. Shared Visual Hierarchy

Every page should follow the same content hierarchy.

```text
Eyebrow label
Page title
Short explanation
Primary action
Main content
Supporting information
Next action
```

## 5.1 Page-title standard

Each page uses:

- One H1
- One short explanatory paragraph
- No unnecessary introductory wall of text

## 5.2 Section-title standard

Each major section uses:

- H2
- Optional one-sentence explanation
- Clear spacing before and after

## 5.3 Card-title standard

Cards use H3 when they represent substantial grouped content.

---

# 6. Shared Component Inventory

Phase 1 should establish the following reusable components.

## Navigation

```text
ApplicationHeader
PrimaryNavigation
MobileNavigation
Breadcrumbs
Footer
```

## Content

```text
HeroSection
SectionHeader
ContentCard
MetricCard
ActionCard
TeamCard
PersonCard
LocationCard
EmptyState
LoadingState
ErrorState
```

## Forms

```text
TextField
EmailField
PhoneField
SelectField
RadioGroup
CheckboxGroup
SearchCombobox
Textarea
FormSection
FieldError
FormErrorSummary
```

## Actions

```text
PrimaryButton
SecondaryButton
TextButton
DangerButton
IconTextButton
StickyMobileActionBar
```

## Feedback

```text
InlineAlert
SuccessBanner
WarningBanner
ErrorBanner
Toast
ConfirmationDialog
```

## Directory

```text
DirectorySearch
FilterPanel
ActiveFilterChips
PersonDirectoryCard
PersonDirectoryRow
DirectorySummary
DirectoryViewToggle
PaginationControls
```

## Leader board

```text
LeaderAccessGate
ContactForm
LocationPicker
NewLocationDialog
DuplicateReviewPanel
ContactSummaryPreview
ArchiveContactDialog
```

---

# 7. Screen 1: Home and Vision Landing Page

## Route

```text
/
```

## Purpose

The landing page explains:

- Why AYC exists
- What it is building
- How leaders participate
- Where to enter the operational Workbench

It should feel like the front door to a serious youth-led statewide organization.

## 7.1 Hero section

Required content structure:

```text
ARKANSAS YOUTH COALITION

A clear vision headline

A short statement describing the statewide youth-led network

Primary action:
Enter the Leader Board

Secondary action:
View the Leadership Directory
```

The exact approved vision language from the Stand Up AYC project must replace temporary copy before final production approval.

## 7.2 Hero visual treatment

The hero should include:

- Strong editorial typography
- Youthful color treatment
- Subtle Arkansas visual reference
- Layered background or visual depth
- No generic government imagery
- No obvious stock-photo dependency

Possible Phase 1 treatment:

- Abstract Arkansas-inspired linework
- Grid or network motif
- Strong type
- Five-team color accents
- Light controlled motion

## 7.3 Vision section

Recommended headings:

```text
Here’s What We Heard
What We Are Building
How We Get There
```

These headings should remain aligned with the user’s established communications preference.

The section should summarize:

- Young Arkansans want meaningful ways to participate.
- Leadership must be developed locally.
- AYC will connect schools, colleges, counties, and communities.
- The organization will be built with the leadership team.

## 7.4 Five-team section

Display five team cards:

```text
Organizer
Voter Registration
Social Media
Events
Outreach
```

Each card includes:

- Team name
- One-sentence purpose
- Short action-oriented description
- No operational metrics during Phase 1
- No dead-link navigation to unbuilt team boards

Cards may include a label:

```text
Phase 1 Team
```

or:

```text
Workbench expansion coming through beta
```

This label must not make the interface feel unfinished.

## 7.5 Build-with-us section

Required message:

```text
This Workbench will grow with the coalition.

AYC leaders will test each phase, identify what they need, and help decide what gets built next.
```

Primary action:

```text
Share Beta Feedback
```

## 7.6 Workbench-entry section

Two large action cards:

### Leader Board

Purpose:

```text
Create and manage the statewide leadership contact list.
```

Action:

```text
Open Leader Board
```

### Leadership Directory

Purpose:

```text
Find the people, locations, teams, and leadership roles building AYC.
```

Action:

```text
View Directory
```

## 7.7 Landing-page mobile behavior

On mobile:

- Hero actions stack vertically
- Team cards use one column
- Action cards use one column
- Typography remains large but does not overflow
- Decorative visual elements must not interfere with readability
- Primary action should appear within the first screen or near it

---

# 8. Screen 2: Leader Board Overview

## Route

```text
/leader
```

## Purpose

The Leader Board is the operational home for the authorized Phase 1 contact-list manager.

It should answer:

- How many contacts exist?
- What was added recently?
- What needs attention?
- What action should happen next?

## 8.1 Access gate

Before write access is active, display:

```text
Leader Entry Access

This area is used to create and manage AYC leadership records.

Enter the leader access code to continue.
```

Fields:

```text
Leader access code
```

Actions:

```text
Unlock Leader Board
Return to Directory
```

Error:

```text
That access code was not accepted. Please check it and try again.
```

Do not reveal whether the code was close, expired, or configured incorrectly.

## 8.2 Unlocked board header

Required content:

```text
Leader Board

Build and maintain the AYC leadership network.
```

Primary action:

```text
Add a Contact
```

Secondary action:

```text
View Directory
```

## 8.3 Summary metrics

Phase 1 metric cards:

```text
Active People
Leads
Volunteers
Locations Represented
```

Metrics should not be overly animated.

Each metric includes:

- Number
- Label
- Optional short definition

## 8.4 Recently added section

Show the five most recently created people.

Each row or card includes:

- Name
- Location code
- Location name
- Primary team
- Position
- Date added
- View or edit action

Empty state:

```text
No contacts have been added yet.

Start by adding the first AYC leader or volunteer.
```

Action:

```text
Add the First Contact
```

## 8.5 Attention section

Potential Phase 1 attention items:

- Possible duplicates awaiting decision
- Contacts missing email and phone
- Records marked prospective
- Records created with new unreviewed location codes

Only display attention items supported by the actual implementation.

Empty state:

```text
Nothing needs attention right now.
```

## 8.6 Quick actions

Approved Phase 1 quick actions:

```text
Add Contact
Create Location
Search Directory
Send Beta Feedback
```

Do not include disabled future actions.

## 8.7 Mobile layout

Mobile sequence:

```text
Page title
Add Contact button
Metrics in two-column grid
Attention items
Recent contacts
Quick actions
```

A sticky bottom action may display:

```text
Add Contact
```

The sticky action must not duplicate too many controls.

---

# 9. Screen 3: New Contact Form

## Route

```text
/leader/contacts/new
```

## Purpose

Allow the leader to create one complete contact record with minimal friction.

## 9.1 Page header

```text
Add a Contact

Add a leader or volunteer to the statewide AYC directory.
```

Supporting reassurance:

```text
You can update this information later.
```

## 9.2 Form organization

The form should be divided into four sections:

```text
1. Person
2. Contact
3. Location
4. Team and Position
```

Avoid presenting every field in one undifferentiated panel.

---

## 9.3 Section 1: Person

Fields:

```text
First name *
Preferred name
Last name *
```

Do not require middle name during Phase 1.

Field guidance:

```text
Preferred name is optional and will be used in the directory when provided.
```

---

## 9.4 Section 2: Contact

Fields:

```text
Email address
Mobile or text number
Preferred contact method
```

Preferred-contact options:

```text
Text
Email
Either
Unknown
```

At least one of email or phone should ordinarily be supplied.

When neither is entered, show a warning:

```text
This contact does not have an email address or phone number.

You may continue, but AYC will not have a direct way to reach them.
```

The warning should not automatically block saving unless the governing product rule changes.

---

## 9.5 Section 3: Location

First field:

```text
Location type *
```

Options:

```text
College
High School
County / Non-Student
```

Second field:

```text
Search for a location *
```

Behavior:

- Search existing locations as the leader types
- Display code and full name
- Show no more than a manageable result count
- Support keyboard selection
- Show a create-new option when no match exists

Example results:

```text
UCA
University of Central Arkansas
College
```

```text
PUL
Pulaski County
County
```

When no match exists:

```text
No matching location found.

Create “University of the Ozarks” as a new college.
```

Action:

```text
Create New Location
```

---

## 9.6 Section 4: Team and Position

Fields:

```text
Primary team *
Position *
Additional teams
Participation status
```

Primary-team options:

```text
Organizer
Voter Registration
Social Media
Events
Outreach
```

Position options:

```text
Lead
Volunteer
```

Additional teams:

- Optional
- Multi-select
- Must not allow duplicate selection of the primary team

Participation-status options:

```text
Active
Prospective
Inactive
```

Default:

```text
Active
```

Do not allow direct creation as archived.

---

## 9.7 Contact summary preview

Before final save, optionally display a compact preview:

```text
Jordan Smith

UCA · University of Central Arkansas
Organizer · Volunteer
Active
```

This preview is useful on desktop and tablet.

It may be omitted on very small screens if it causes clutter.

---

## 9.8 Form actions

Desktop and tablet:

```text
Save Contact
Save and Add Another
Cancel
```

Mobile sticky action bar:

```text
Save Contact
```

Secondary mobile actions remain within the form:

```text
Save and Add Another
Cancel
```

## 9.9 Save behavior

When selecting `Save Contact`:

1. Preserve visible form values.
2. Validate locally.
3. Submit to server.
4. Show in-button progress.
5. Disable duplicate submissions.
6. Process duplicate result.
7. Show success or actionable error.

Loading label:

```text
Saving Contact…
```

## 9.10 Successful save

Success page or banner:

```text
Contact Added

Jordan Smith is now part of the AYC leadership directory.
```

Actions:

```text
View Contact
Add Another Contact
Return to Leader Board
```

If the user chose `Save and Add Another`:

- Show compact success confirmation
- Clear the form
- Preserve sensible defaults only when appropriate
- Return focus to first-name field

---

# 10. New Location Dialog or Screen

## Trigger

From the contact form or Leader Board quick actions.

## Purpose

Create a college, high school, or county location without leaving the contact workflow.

## 10.1 Recommended presentation

Desktop and tablet:

- Accessible modal dialog or side panel

Mobile:

- Full-screen dialog or dedicated nested screen

## 10.2 Fields

```text
Location type *
Official location name *
Short display name
City
County
Suggested three-letter code *
```

Behavior:

- Location type inherits from the contact form when possible
- Suggested code generates after name entry
- Leader may edit the code
- Composite code displays for clarity

Example:

```text
Display code: UCA
System code: COL-UCA
```

## 10.3 Code explanation

Provide compact guidance:

```text
Every AYC location receives a memorable three-letter code.

The code must be unique within its location type.
```

## 10.4 Conflict state

```text
UCA is already used by another college.

Try a different three-letter code.
```

Offer suggestions where practical.

## 10.5 Actions

```text
Create Location
Cancel
```

After successful creation:

- Close the dialog
- Select the new location automatically in the contact form
- Announce success accessibly
- Preserve all other contact-form information

Success message:

```text
University of Central Arkansas was added as UCA.
```

---

# 11. Duplicate Review Screen or Panel

## Trigger

The server identifies a possible, likely, or exact duplicate.

## Purpose

Prevent duplicate people without preventing valid entry.

## 11.1 Possible duplicate

Display:

```text
We found a possible match.

Review the existing record before creating a new person.
```

Show comparison cards:

### New entry

- Name
- Email
- Phone
- Location
- Team

### Existing record

- Name
- Masked or authorized contact
- Location
- Team
- Status

Actions:

```text
Use Existing Record
Create as a Different Person
Return to Form
```

## 11.2 Likely duplicate

Use stronger language:

```text
This person may already be in the directory.
```

Require explicit selection before continuing.

## 11.3 Exact duplicate

Display:

```text
This contact already appears to exist.

Open the existing record to review or update it.
```

Actions:

```text
Open Existing Record
Return to Form
```

The default interface should not allow bypassing an exact email or phone match.

## 11.4 Mobile behavior

Comparison cards stack vertically.

The existing record should be presented first after the warning, followed by the proposed new entry.

---

# 12. Screen 4: Leader Contact Detail and Edit

## Route

```text
/leader/contacts/:personId
```

## Purpose

Allow authorized leaders to review and update one canonical person record.

## 12.1 Header

Display:

```text
Jordan Smith

UCA · Organizer · Volunteer
```

Status badge:

```text
Active
Prospective
Inactive
Archived
```

Primary actions:

```text
Edit Contact
View in Directory
```

More-actions menu:

```text
Archive Contact
Restore Contact
```

Only display actions supported by the current status.

## 12.2 Information sections

```text
Contact Information
Location
Teams and Position
Record Information
```

## 12.3 Contact information

Display:

- Email
- Phone
- Preferred contact method
- Verification status only when meaningful

## 12.4 Location

Display:

- Location name
- Three-letter code
- Location type
- City or county when available

## 12.5 Teams

Display:

- Primary team
- Position
- Additional teams
- Assignment status

## 12.6 Record information

Display:

- Participation status
- Date added
- Last updated
- Source

Avoid displaying internal UUIDs.

## 12.7 Edit mode

Edit mode should use the same form components as contact creation.

Actions:

```text
Save Changes
Cancel
```

Saving should:

- Preserve input on errors
- Re-run duplicate checks when email or phone changes
- Write an audit event
- Display a concise change success message

Success:

```text
Contact Updated

Jordan Smith’s record has been saved.
```

---

# 13. Archive Contact Confirmation

## Trigger

Authorized leader selects `Archive Contact`.

## Dialog content

```text
Archive Jordan Smith?

This person will be removed from the active directory but their history will be preserved.
```

Optional reason:

```text
Reason for archiving
```

Recommended predefined options:

```text
No longer active
Duplicate record
Requested removal
Entered in error
Other
```

Action hierarchy:

```text
Archive Contact
Cancel
```

The archive action uses a clear danger style but should not feel catastrophic.

Success:

```text
Contact Archived

Jordan Smith has been removed from active directory views.
```

Actions:

```text
Return to Leader Board
Restore Contact
```

---

# 14. Restore Contact Confirmation

## Trigger

Viewing an archived record.

Content:

```text
Restore Jordan Smith?

This person will return to active operational views.
```

The user should select the restored status:

```text
Active
Prospective
Inactive
```

Actions:

```text
Restore Contact
Cancel
```

---

# 15. Screen 5: Leadership Directory

## Route

```text
/directory
```

## Purpose

Provide a clean statewide view of AYC people, teams, and locations.

The page should make it possible to find a person within seconds.

## 15.1 Header

```text
Leadership Directory

Find the people and places building the Arkansas Youth Coalition.
```

## 15.2 Summary metrics

Display:

```text
Active People
Leads
Volunteers
Locations
```

On mobile, summary cards should not push search too far below the top.

Recommended mobile treatment:

- Compact two-by-two metrics
- Or horizontally scrollable metric row
- Search remains close to page title

## 15.3 Search

Large search field:

```text
Search by name, school, college, county, code, or team
```

Search should support:

- Person names
- Preferred names
- Location names
- Three-letter codes
- Team names

Search should debounce or submit deliberately to avoid unnecessary server traffic.

## 15.4 Filters

Approved filters:

```text
Location type
Location
Team
Position
Status
```

Default status:

```text
Active
```

Filter behavior:

- Active filters appear as removable chips
- `Clear all` appears when filters are active
- Filter state uses URL parameters where practical
- Mobile filters open in a full-height drawer or panel
- Results count updates clearly

## 15.5 View modes

Approved Phase 1 views:

```text
People
Teams
Locations
```

Default:

```text
People
```

View choice should be represented in the URL or retained during the session.

---

# 16. Directory People View

## Desktop presentation

Use a responsive table or structured row list.

Columns:

```text
Name
Location
Primary Team
Position
Status
Contact
```

The table must remain readable and not become excessively dense.

## Mobile presentation

Use cards.

Each card contains:

```text
Jordan Smith
UCA · University of Central Arkansas
Organizer · Volunteer
Active

View Contact
```

Contact controls may include:

```text
Email
Text
```

Only when the viewer is authorized to reveal or use full contact details.

## Contact masking

Default display may use:

```text
j••••@example.com
•••-•••-1234
```

Selecting a reveal action should be deliberate.

Full contact details should not be returned to the frontend unless the viewer is authorized to receive them.

## Empty result

```text
No people match these filters.

Try removing a filter or searching for a different name, team, or location.
```

Actions:

```text
Clear Filters
```

Authorized leader may also see:

```text
Add Contact
```

---

# 17. Directory Teams View

## Purpose

Show how the statewide network is distributed among the five teams.

Each team card includes:

```text
Team name
Short purpose
Active people
Leads
Volunteers
Locations represented
```

Example:

```text
Organizer

12 active people
3 leads · 9 volunteers
8 locations represented
```

Selecting a card filters or opens the people list for that team.

No separate team dashboard is created during Phase 1.

## Empty team

```text
No active people are assigned to this team yet.
```

This is an organizational signal, not an error.

---

# 18. Directory Locations View

## Purpose

Show where AYC currently has representation.

Group options:

```text
Colleges
High Schools
Counties
```

Each location card includes:

```text
Three-letter code
Full location name
Location type
Active people
Leads
Teams represented
```

Example:

```text
UCA
University of Central Arkansas
College

8 active people
2 leads
4 teams represented
```

Selecting a location filters the People view.

## Empty location category

```text
No high schools are represented yet.

Locations will appear as leaders and volunteers are added.
```

---

# 19. Screen 6: Directory Person Detail

## Route

```text
/directory/:personId
```

## Purpose

Provide a readable contact profile without exposing administrative controls to all viewers.

## 19.1 Header

```text
Jordan Smith

UCA · University of Central Arkansas
Organizer · Volunteer
```

## 19.2 Content

Display:

```text
Team
Position
Additional Teams
Location
Participation Status
Preferred Contact Method
```

Contact details:

- Masked by default or controlled according to Phase 1 access settings
- Reveal control when authorized
- Email and text actions use accessible labels

## 19.3 Actions

General viewer:

```text
Back to Directory
```

Authorized leader:

```text
Edit Contact
```

Do not show archive controls on the general directory profile.

## 19.4 Missing contact state

```text
Direct contact information has not been added for this person.
```

Do not display empty labels such as `Phone: null`.

---

# 20. Screen 7: Beta Feedback

## Route

```text
/feedback
```

## Purpose

Capture structured leadership feedback from every beta phase.

## 20.1 Header

```text
Help Build the Workbench

Tell us what is confusing, missing, difficult, or worth improving.
```

## 20.2 Fields

```text
What kind of feedback is this? *
Where did this happen?
Tell us what happened or what you need. *
Your name
Best way to follow up
```

Category options:

```text
Something is confusing
Something is missing
Something is difficult on mobile
I found an error
I have an idea
I have a privacy concern
I found an accessibility problem
```

Page context should prefill when arriving from the persistent feedback control.

## 20.3 Guidance

```text
Be as specific as you can.

What were you trying to do?
What happened?
What would have made it easier?
```

## 20.4 Actions

```text
Submit Feedback
Cancel
```

## 20.5 Success state

```text
Feedback Received

Thank you for helping shape the AYC Workbench.

Reference: AYC-FB-000128
```

Actions:

```text
Return to Previous Page
Submit More Feedback
```

## 20.6 Error state

```text
We could not submit your feedback.

Your message is still on the screen. Please try again.
```

The form must preserve the user’s writing.

---

# 21. Screen 8: Not Found

## Route

Fallback.

Content:

```text
This Page Is Not Available

The link may be outdated, or the page may not be part of the current beta.
```

Actions:

```text
Return Home
Open Directory
```

Do not expose technical routing details.

---

# 22. Loading States

Blank screens are prohibited.

## 22.1 Page loading

Use:

- Skeleton page heading
- Skeleton metric cards
- Skeleton list rows or cards

## 22.2 Form submission

Use:

- In-button loading text
- Disabled repeat submission
- Preserve field values

## 22.3 Directory search

Use:

- Small results-loading indicator
- Keep previous results visible when practical
- Avoid full-page flashing

Loading copy:

```text
Updating results…
```

## 22.4 Slow database response

After an appropriate delay, show:

```text
This is taking longer than expected.

We are still trying to load the directory.
```

Do not instruct the user to repeatedly submit.

---

# 23. Empty States

Every empty state must include:

- What is empty
- Why that may be true
- What the user can do next

Examples:

## Empty directory

```text
The AYC directory is ready for its first contact.

Add the first leader or volunteer to begin building the statewide network.
```

## Empty search

```text
No contacts match your search.
```

## Empty recent contacts

```text
No contacts have been added yet.
```

## Empty team

```text
No active people are assigned to Events yet.
```

## Empty locations

```text
No colleges have been added yet.
```

---

# 24. Success States

Success messages should be clear, warm, and specific.

Approved examples:

```text
Contact Added
Contact Updated
Contact Archived
Contact Restored
Location Created
Feedback Submitted
Leader Board Unlocked
```

Avoid vague success text such as:

```text
Done
Success
Operation completed
```

Success messages should identify what changed.

---

# 25. Error States

## 25.1 Field validation

Display errors directly below the affected field.

Example:

```text
Enter a first name.
```

## 25.2 Form summary

When several fields fail, display a summary near the top:

```text
Please review the highlighted fields.
```

The summary should link or move focus to affected inputs where practical.

## 25.3 Server error

```text
We could not save this contact.

Your information is still on the screen. Please try again.
```

## 25.4 Authorization error

```text
Your leader access is no longer active.

Unlock the Leader Board again to continue.
```

## 25.5 Not found

```text
We could not find that contact.

It may have been archived or the link may be outdated.
```

## 25.6 Rate limit or abuse protection

```text
Too many requests were received.

Please pause briefly and try again.
```

Do not reveal security configuration.

---

# 26. Confirmation Dialog Standards

Confirmation is required for:

- Archiving a contact
- Restoring an archived contact when status selection matters
- Leaving a form with unsaved changes
- Creating a new person despite a likely duplicate warning

Confirmation is not required for:

- Normal navigation
- Search
- Filter changes
- Revealing masked contact information
- Opening a contact profile

Dialog buttons must clearly name the action.

Good:

```text
Archive Contact
Keep Contact Active
```

Avoid:

```text
Yes
No
Okay
```

---

# 27. Unsaved Changes

When a user attempts to leave a contact form with unsaved changes:

```text
Leave Without Saving?

The changes you entered will be lost.
```

Actions:

```text
Keep Editing
Leave Without Saving
```

The browser’s native unload protection may supplement but should not replace clear in-app handling where practical.

---

# 28. Responsive Layout Standards

## 28.1 Mobile

Primary breakpoint philosophy:

- One-column layouts
- Full-width form controls
- Large touch targets
- Sticky primary actions when helpful
- Cards instead of wide tables
- Filter drawers
- Minimal persistent chrome
- Safe-area spacing

Minimum touch target should generally be at least 44 by 44 CSS pixels.

## 28.2 Tablet

Tablet is the preferred leadership-workbench experience.

Use:

- Two-column form sections where appropriate
- Persistent navigation when space allows
- Split summary and activity panels
- Larger directory rows
- Comfortable landscape dashboards

## 28.3 Desktop

Use:

- Centered max-width content
- Multi-column dashboards
- Table directory view
- Persistent filters when helpful
- Clear whitespace
- No excessive stretching across ultrawide screens

---

# 29. Mobile Thumb-Zone Standards

Frequently used mobile actions should remain easy to reach.

Priority actions:

```text
Add Contact
Save Contact
Search
Open Filters
Submit Feedback
```

Do not place every action in a sticky bottom bar.

A sticky bar should contain one dominant action or a very small action pair.

Danger actions should not be permanently sticky.

---

# 30. Accessibility Standards by Screen

Every screen must support:

- Semantic headings
- Visible keyboard focus
- Logical tab order
- Accessible form labels
- Clear error association
- Screen-reader status announcements
- Keyboard-operable dialogs
- Escape-to-close when appropriate
- Focus return after dialog close
- Reduced-motion preference
- High-contrast text
- Non-color status labels

Examples:

A status badge must include text:

```text
Active
```

It cannot rely only on green color.

A duplicate warning must be announced to screen readers when it appears.

---

# 31. Content and Voice Standards

AYC interface language should be:

- Direct
- Warm
- Encouraging
- Youth-respecting
- Professional
- Action-oriented

Use:

```text
Add a Contact
Build the Directory
Review This Record
Tell Us What You Need
```

Avoid:

```text
Submit Entity
Execute Record Creation
Invalid Operation
User Error
```

Do not speak to youth leaders as children.

Do not use forced slang.

---

# 32. Privacy Language

Forms collecting contact details should include a short notice:

```text
This information is used by the Arkansas Youth Coalition leadership team to organize and communicate within the protected Workbench.
```

For high-school contacts or future minors, additional approved privacy language will be required before broader rollout.

The interface must not claim comprehensive legal compliance without formal review.

---

# 33. Contact Reveal Behavior

Phase 1 contact visibility should be configurable.

Recommended default:

- Mask email and phone in directory lists
- Allow reveal on individual contact detail
- Provide full values to the browser only when the current access condition permits it

Reveal action labels:

```text
Show Email Address
Show Phone Number
```

After reveal:

```text
Email Jordan
Text Jordan
```

The system should not record contact reveal as a high-friction workflow during the small trusted beta unless privacy testing indicates it is needed.

---

# 34. Search and Filtering Details

## 34.1 Search matching

Search should match:

- First name
- Preferred name
- Last name
- Full name
- Location name
- Location short name
- Three-letter code
- Team name

## 34.2 Filter behavior

Filters combine with AND logic.

Example:

```text
Team = Organizer
Position = Lead
Location Type = College
```

returns active college-based Organizer leads.

## 34.3 Filter chips

Example:

```text
Organizer ×
Lead ×
College ×
```

## 34.4 Result count

Display:

```text
12 people found
```

Use singular correctly:

```text
1 person found
```

## 34.5 No filter state

Do not display a row of empty filter chips.

---

# 35. Sorting

Phase 1 people sorting:

```text
Name A–Z
Recently Added
Location
Team
```

Default:

```text
Name A–Z
```

Sorting should not reset active filters.

Teams and locations views may sort by:

```text
Name
Most People
Most Leads
```

---

# 36. Pagination and Result Limits

For small beta datasets, the directory may initially show a bounded result list.

Recommended approach:

- Default page size: 25
- Allow next and previous navigation
- Preserve search and filter state

Do not load an unlimited statewide contact list into the browser as the system grows.

Mobile pagination labels:

```text
Previous
Next
```

Desktop may additionally show page position.

---

# 37. Form Field Standards

Every form field should include:

- Visible label
- Required indicator when required
- Optional guidance when useful
- Error placement
- Sensible autocomplete attribute
- Correct mobile keyboard type

Examples:

Email:

```text
input type="email"
autocomplete="email"
```

Phone:

```text
input type="tel"
autocomplete="tel"
```

Names:

```text
autocomplete="given-name"
autocomplete="family-name"
```

Do not use placeholder text as the only label.

---

# 38. Contact Form Field Limits

Suggested limits:

```text
First name: 100 characters
Preferred name: 100 characters
Last name: 100 characters
Email: 254 characters
Phone display input: 30 characters
Location name: 200 characters
Short location name: 100 characters
Feedback description: 5,000 characters
```

The interface should prevent absurd values without being unnecessarily restrictive.

---

# 39. Notification and Toast Standards

Use toasts only for temporary, noncritical confirmation.

Good toast uses:

```text
Filters cleared.
Location selected.
Contact information copied.
```

Do not place critical errors only in disappearing toasts.

Critical save success or failure should remain visible within the page.

---

# 40. Copy and Clipboard Behavior

Authorized contact details may include copy actions:

```text
Copy Email
Copy Phone Number
```

After copy:

```text
Email copied.
```

Copy actions should not appear when data is masked and unavailable.

---

# 41. External Communication Actions

Phase 1 may support device-native links:

```text
mailto:
tel:
sms:
```

These actions open the user’s existing device applications.

The AYC Workbench does not send messages during Phase 1.

Labels must make this clear through normal behavior.

No communication log should be inferred from opening an external email or text application.

---

# 42. Beta Review Mode

Optional Phase 1 beta affordance:

A small visible label:

```text
Leadership Beta
```

A beta information panel may explain:

```text
This first version focuses on people, locations, teams, and feedback.

New functions will be chosen from leadership-team testing.
```

The panel should be dismissible per session but remain accessible from the footer or feedback page.

---

# 43. Visual QA Checklist

Every screen must be checked for:

- Correct heading hierarchy
- Consistent spacing
- Button hierarchy
- Mobile overflow
- Tablet layout
- Desktop max width
- Empty states
- Long names
- Long school names
- Long email addresses
- Error messages
- Loading states
- Archived status
- Reduced motion
- Keyboard focus
- Screen-reader labels

Test examples should include:

```text
University of Arkansas Community College at Morrilton
```

and similarly long institution names.

---

# 44. Required Phase 1 User Journeys

## Journey A: First contact

```text
Home
→ Leader Board
→ Unlock
→ Add Contact
→ Create New Location
→ Save Contact
→ View Contact
→ View in Directory
```

## Journey B: Existing location

```text
Leader Board
→ Add Contact
→ Search Existing Location
→ Assign Team and Position
→ Save and Add Another
```

## Journey C: Duplicate prevention

```text
Add Contact
→ Submit
→ Possible Duplicate Warning
→ Open Existing Record
→ Update Existing Record
```

## Journey D: Directory search

```text
Directory
→ Search UCA
→ Filter Organizer
→ Open Person
→ Reveal Contact
```

## Journey E: Archive

```text
Leader Board
→ Open Contact
→ Archive Contact
→ Confirm
→ Verify Removed from Active Directory
```

## Journey F: Feedback

```text
Any Page
→ Send Beta Feedback
→ Prefilled Page Context
→ Submit
→ Receive Reference Code
```

---

# 45. Screen Acceptance Standards

A screen is not complete until:

- Primary purpose is obvious.
- One clear primary action exists.
- Mobile layout is usable.
- Tablet layout is polished.
- Desktop layout is stable.
- Loading state exists.
- Empty state exists when applicable.
- Error state exists.
- Success state exists when applicable.
- Keyboard navigation works.
- Screen-reader labels exist.
- Form data is preserved after recoverable errors.
- No unauthorized future features appear.
- Copy matches AYC voice.
- Privacy-sensitive fields are handled correctly.

---

# 46. Phase 1 Screen Inventory

## Public-facing within the protected site

```text
Home / Vision
Leadership Directory
Directory Person Detail
Beta Feedback
Not Found
```

## Write-authorized

```text
Leader Board Overview
New Contact
Leader Contact Detail
Edit Contact
New Location
Duplicate Review
Archive Confirmation
Restore Confirmation
```

## System states

```text
Loading
Empty
Error
Unauthorized
Session Expired
Success
No Results
Offline or Network Failure
```

---

# 47. Explicitly Deferred Screens

Do not build these during Phase 1:

```text
Team dashboards
Regional dashboards
School dashboards
County dashboards
Event calendar
Event registration
Attendance
Volunteer hours
Messaging center
Email composer
Text composer
Training portal
AI assistant
Personal profile
Individual account settings
Role administration
Import center
Export center
Audit-log viewer
Advanced analytics
Public membership signup
```

Future routes or cards should not be teased unless there is an intentional beta-roadmap section approved for display.

---

# 48. Phase 1 Design Completion Standard

Volume VI is satisfied when the implemented Workbench contains:

- One strong AYC vision landing page
- One protected Leader Board
- One contact-creation workflow
- One location-creation workflow
- One duplicate-review workflow
- One contact-detail and edit workflow
- One archive and restore workflow
- One searchable and filterable directory
- People, teams, and locations directory views
- One contact-detail display page
- One structured beta-feedback workflow
- Complete responsive states
- Complete loading, empty, success, and error states
- Accessible navigation and forms
- No unauthorized expansion beyond Phase 1

---

# 49. Governing Screen Principle

Every screen must make the next meaningful action obvious.

The AYC Workbench should never force a young leader to study the software before they can use it.

The experience should quietly guide them from:

```text
Understanding
to
Organizing
to
Acting
to
Improving
```

The interface is successful when the technology fades into the background and the leadership work becomes easier.

---

**Next:** Volume VII — Development Governance and Cursor Build Protocol (repository rules, phase gates, build-return requirements, deployment, beta approval gates, exact Cursor sequence before implementation).

**Implementation gate:** No application code until Volume VII is ingested (or the owner explicitly authorizes an earlier start). Cursor must not invent unapproved screens, actions, fields, or navigation during Phase 1.
