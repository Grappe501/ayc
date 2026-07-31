# Backup and Recovery — Phase 1

## Scope

PostgreSQL holds AYC Phase 1 operational data: people, contact methods, locations, team assignments, beta feedback, and audit events.

## Provider backups

1. Confirm the managed Postgres provider (Netlify DB / Neon / equivalent) has **automated daily backups** enabled.
2. Note retention window (recommend ≥ 7 days for beta).
3. Record where restore is performed (provider console).

| Item | Value / status |
|------|----------------|
| Provider | _fill in_ |
| Project / cluster | _fill in_ |
| Daily backups enabled | ☐ |
| Retention | _fill in_ |
| Last restore drill date | _fill in_ |

## What to back up before risky changes

- Run provider snapshot or confirm latest automated backup before migrations.
- Keep `DATABASE_URL` and `AYC_LEADER_WRITE_SECRET` only in Netlify env / local `.env` (never git).
- Application code is recoverable from GitHub `main`.

## Restore procedure (outline)

1. Pause write traffic if needed (Netlify password / temporary maintenance note).
2. Restore database from provider backup to a point in time or snapshot.
3. Confirm `npm run db:migrate` is not required (restored DB already includes schema) **or** re-apply only missing migrations carefully.
4. Re-seed teams only if team rows are missing: `npm run db:seed-teams`.
5. Verify `/api/health` reports `database.ok: true` (no error detail in production).
6. Spot-check Leader Board unlock, directory, and one contact record.
7. Resume traffic.

## Rollback of application code

1. Identify last known good commit on `main`.
2. Revert or redeploy prior Netlify deploy (Netlify deploy history).
3. Do **not** force-push secrets or rewrite published history casually.

## Restore tested?

☐ Restore drill completed on a non-production or disposable branch/database  
☐ Notes attached to this file or Decision Log
