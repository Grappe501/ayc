# Route Inventory

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Phase 1B complete | Vision landing |
| `/leader` | Complete | Statewide Leader Board + Team Lead Board hub |
| `/leader/gaps` | Complete | Contact gap-fill sprint (phone/email queue) |
| `/leader/feedback` | Complete | Leader-gated beta feedback inbox (status, severity, notes) |
| `/leader/teams/:teamSlug` | Complete | Five Team Lead Boards (`organizer`, `voter-registration`, `social-media`, `events`, `outreach`) |
| `/leader/contacts/new` | Complete | Contact create |
| `/leader/contacts/:personId` | Complete | Contact detail / edit / archive |
| `/directory` | Complete | People / teams / locations views |
| `/directory/:personId` | Complete | Directory person (masked) |
| `/feedback` | Complete | Beta feedback |
| `/join` | Complete | Public join application (educates + captures interest) |
| `/workbench` | Alias → Leader | |
| `/people` | Alias → Directory | |
| `/add-contact` | Alias → New contact | |
| `*` | 404 | |

Reserved for later phases (do not ship stubs): `/teams` (public/future RBAC boards), `/admin`, `/events`, `/training`, `/messages`, `/analytics`, `/profile`, `/settings`

Phase 2 planned (not built yet — see `10-PHASE-2-MASTER-PLAN.md`): `/join`, `/leader/applications`, `/leader/segments/high-school`, `/leader/segments/working-class`, `/leader/locations/:id`, `/leader/locations/:id/teams/:slug`, `/leader/teams/social-media/graphic-design`, `/leader/calendar`, `/leader/reports`

Phase 1 Team Lead Boards live under `/leader/teams/*` (same unlock as Leader Board). Full Phase 2 Team Boards (tasks, resources, communication, reports) remain deferred.
