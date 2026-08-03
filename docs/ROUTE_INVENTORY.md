# Route Inventory

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Phase 1B complete | Vision landing |
| `/leader` | Complete | Statewide Leader Board + per-team attention digests + Team Lead Board hub |
| `/leader/gaps` | Complete | Contact gap-fill sprint (phone/email queue) |
| `/leader/duplicates` | Complete | Duplicate pair queue + merge into survivor (archives loser) |
| `/leader/feedback` | Complete | Leader-gated beta feedback inbox (status, severity, notes) |
| `/leader/teams/:teamSlug` | Complete | Five statewide Category Boards + Mission + Tasks + Resources |
| `/leader/teams/social-media/graphic-design` | Complete | Graphic Design secondary board (under Social Media) |
| `/leader/segments/high-school` | Complete | HS Lead Organizer workspace (develop leads + coverage) |
| `/leader/segments/working-class` | Complete | WC Lead Organizer workspace (develop leads + coverage) |
| `/leader/locations/:locationId` | Complete | Location TEAM board (all people at location) |
| `/leader/locations/:locationId/teams/:teamSlug` | Complete | Location category board (five categories; not GD) |
| `/leader/contacts/new` | Complete | Contact create |
| `/leader/contacts/:personId` | Complete | Contact detail / edit / archive / pipeline tags |
| `/directory` | Complete | People / teams / locations views |
| `/directory/:personId` | Complete | Directory person (masked) |
| `/feedback` | Complete | Beta feedback |
| `/calendar` | Complete | Public events — month/week/day grid + ICS subscribe |
| `/calendar/event/:eventId` | Complete | Public event drill-down |
| `/leader/calendar/event/:eventId` | Complete | Leader event detail + RSVPs |
| `/login` | Complete | Personal account login (Supabase Auth) |
| `/forgot-password` | Complete | Request password reset email (invite accounts) |
| `/reset-password` | Complete | Set new password from recovery link |
| `/auth/callback` | Complete | Google OAuth callback → invite-gated bind |
| `/claim` | Complete | Claim invite + set password (invite-only) |
| `/join` | Complete | Public join → `membership_applications` queue (person created on Accept) |
| `/join/thanks` | Complete | Join confirmation + reference code |
| `/leader/applications` | Complete | Join applications inbox (master key) |
| `/leader/reports` | Complete | Coverage + pipeline hub (master key) |
| `/leader/calendar` | Complete | Nested calendars hub + create |
| `/workbench` | Alias → Leader | |
| `/people` | Alias → Directory | |
| `/add-contact` | Alias → New contact | |
| `*` | 404 | |

Reserved for later phases (do not ship stubs): `/teams` (public/future RBAC boards), `/admin`, `/events`, `/training`, `/messages`, `/analytics`, `/profile`, `/settings`

Phase 2 live: `/join`, `/join/thanks`, `/calendar`, `/login`, `/claim`, `/leader/applications`, `/leader/reports`, `/leader/calendar`, `/leader/segments/*`, `/leader/locations/*`, `/leader/teams/social-media/graphic-design`. Directory person pages are full Directory Profiles.

V3 upgrade plan: `docs/plans/AYC_V3_UPGRADE_PLAN.md`

Phase 1 Team Lead Boards live under `/leader/teams/*` (same unlock as Leader Board). Full Phase 2 Team Boards (tasks, resources, communication, reports) remain deferred.

Reserved `/profile` remains unused — personal profile lives at `/directory/:personId` (“My profile” in nav).
