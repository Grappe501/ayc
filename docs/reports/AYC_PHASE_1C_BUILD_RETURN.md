# BUILD RETURN — AYC-PHASE-1C-DATA-FOUNDATION-1.0

## Slice

Data foundation for Leadership Workbench: Postgres schema, migrations, team seed, domain helpers, repositories. No leader write UI (1D) and no directory search UI (1F).

## Delivered

- Drizzle schema + `postgres` client (`server/db/client.ts`, `schema.ts`)
- SQL migration `001_init.sql` for:
  - `people`, `person_contact_methods`
  - `locations`, `person_location_affiliations`
  - `teams`, `person_team_assignments`
  - `beta_feedback`, `audit_events`
- Canonical five-team seed (`npm run db:seed-teams`)
- Domain layer: enums, email/phone/name normalization, location codes, contact validation, duplicate assessment
- Repositories: teams, locations, people (transactional create), feedback, audit
- Health function reports optional database ping when `DATABASE_URL` is set
- Unit tests for normalization, duplicates, validation, location codes, migration presence

## Commands

```bash
npm run db:migrate
npm run db:seed-teams
npm run validate
```

## Out of scope (next slices)

- Leader write-access gate + contact form UI (1D)
- Contact edit / archive UI (1E)
- Directory search UI (1F)
- Feedback form UI (1G)

## Validation

- `npm run validate` — typecheck, lint, 33 tests, production build — passed

## Notes

- Browser code must not import `server/db/*`.
- Duplicate logic is pure and unit-tested; wired into HTTP create in 1D.
- Migrations skip `000_placeholder.sql` by filename convention.
