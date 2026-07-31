# BUILD RETURN — AYC-PHASE-1E-CONTACT-MANAGEMENT-1.0

## Slice

Leader contact detail, edit, archive, restore, audit trail writing, and duplicate recheck on contact changes.

## Delivered

- `GET/PATCH /.netlify/functions/contact?id=`
- `POST /.netlify/functions/archive-contact`
- `POST /.netlify/functions/restore-contact`
- Contact detail page at `/leader/contacts/:personId`
- Edit mode reuses create form components with save/cancel
- Archive confirmation (reason options) + Restore confirmation (status choice)
- Audit events: `PERSON_UPDATED`, `PERSON_STATUS_CHANGED`, `PERSON_ARCHIVED`, `PERSON_RESTORED`, contact-method and team-assignment events
- Duplicate recheck on edit when name/email/phone changes (excludes self)

## Out of scope (next)

- Public directory search/filters (1F)
- Feedback form UI (1G)
