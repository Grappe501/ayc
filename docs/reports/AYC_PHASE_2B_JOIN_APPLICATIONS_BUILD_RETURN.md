# BUILD RETURN — Phase 2B Join CTA + Applications

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-2B-JOIN-CTA-APPLICATIONS`

## Done

- `membership_applications` table + migration `009_membership_applications.sql`
- Public `/join` saves an application (no immediate person create)
- `/join/thanks` confirmation route with reference code
- `/leader/applications` inbox: review / accept / decline
- Accept creates Prospective `JOIN_FORM` person + team assignment + lead-interest pipeline tags (or links matched person on DUPLICATE)
- Landing Join CTAs remain wired to `/join`

## Boundaries

- Email notify to Chance deferred to **2C** (no outbox / provider yet)
- Public directory still excludes applicants until Accept
- Age confirmation remains checkbox (birthdate TBD per plan §13)
