# BUILD RETURN — AYC-PHASE-1F-LEADERSHIP-DIRECTORY-1.0

## Slice

Public leadership directory with summary metrics, search, filters, sorting, and People / Teams / Locations views plus person detail with contact masking.

## Delivered

- `GET /api/directory-summary`
- `GET /api/directory?view=people|teams|locations|options` (+ filter query params)
- `GET /api/directory-person?id=`
- Directory UI at `/directory` with URL-synced filters (`q`, `team`, `location`, `locationType`, `position`, `status`, `sort`, `view`)
- Debounced search; removable filter chips; mobile filter drawer
- People table (desktop) / cards (mobile)
- Teams and Locations aggregation cards that jump into filtered People view
- `/directory/:personId` profile (masked contacts by default; full reveal when leader write secret present)
- Edit Contact link for unlocked leaders only (no archive on public profile)

## Contact masking

Full email/phone are returned only when `X-AYC-Leader-Write-Secret` matches. Otherwise masked forms such as `j••••@example.com` / `•••-•••-1234`.

## Out of scope (next)

- Feedback form UI (1G)
- Beta readiness checklist (1H)
