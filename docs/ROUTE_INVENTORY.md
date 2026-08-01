# Route Inventory

| Route | Status | Notes |
|-------|--------|-------|
| `/` | Phase 1B complete | Vision landing |
| `/leader` | Complete | Statewide Leader Board + per-team attention digests + Team Lead Board hub |
| `/leader/gaps` | Complete | Contact gap-fill sprint (phone/email queue) |
| `/leader/duplicates` | Complete | Duplicate pair queue + merge into survivor (archives loser) |
| `/leader/feedback` | Complete | Leader-gated beta feedback inbox (status, severity, notes) |
| `/leader/teams/:teamSlug` | Complete | Five Team Lead Boards + Mission + Tasks + Resources |
| `/leader/contacts/new` | Complete | Contact create |
| `/leader/contacts/:personId` | Complete | Contact detail / edit / archive / pipeline tags |
| `/directory` | Complete | People / teams / locations views |
| `/directory/:personId` | Complete | Directory person (masked) |
| `/feedback` | Complete | Beta feedback |
| `/join` | Complete | Public join → creates `PROSPECTIVE` person (`JOIN_FORM`) on chosen team + feedback notify |
| `/workbench` | Alias → Leader | |
| `/people` | Alias → Directory | |
| `/add-contact` | Alias → New contact | |
| `*` | 404 | |

Reserved for later phases (do not ship stubs): `/teams` (public/future RBAC boards), `/admin`, `/events`, `/training`, `/messages`, `/analytics`, `/profile`, `/settings`

Phase 2 planned (not built yet — see `10-PHASE-2-MASTER-PLAN.md`): `/join`, `/leader/applications`, `/leader/segments/high-school`, `/leader/segments/working-class`, `/leader/locations/:id`, `/leader/locations/:id/teams/:slug`, `/leader/teams/social-media/graphic-design`, `/leader/calendar`, `/leader/reports`

Phase 1 Team Lead Boards live under `/leader/teams/*` (same unlock as Leader Board). Full Phase 2 Team Boards (tasks, resources, communication, reports) remain deferred.
