# BUILD RETURN — Phase 2 Directory Profiles

**Date:** 2026-08-01  
**Slice:** `AYC-PHASE-2-DIRECTORY-PROFILES`

## Done

- Schema: `person_profiles`, `person_profile_notes` (`014_person_profiles.sql`) — applied on Supabase
- Storage bucket `profile-photos` (public, 2MB, jpeg/png/webp)
- `/directory/:personId` rebuilt: affiliation band, upper-right photo, narrative (hometown/major/interests), notes
- Owner JWT or leader unlock can edit profile + photo
- Logged-in users leave PUBLIC/PRIVATE notes; private visible to owner + leaders
- APIs: extend `directory-person`, `PATCH person-profile`, `POST person-profile-photo`, `POST/DELETE person-profile-notes`

## Boundaries

- Owners do not self-assign teams/locations (leaders edit contact record)
- Private notes never returned to unauthenticated public viewers
