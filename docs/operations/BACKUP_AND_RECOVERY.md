# Backup and Recovery — Phase 1

## Scope

PostgreSQL holds AYC Phase 1 operational data: people, contact methods, locations, team assignments, beta feedback, and audit events.

## Provider backups

1. Confirm the managed Postgres provider (Netlify DB / Neon / equivalent) has **automated daily backups** enabled.
2. Note retention window (recommend ≥ 7 days for beta).
3. Record where restore is performed (provider console).

| Item | Value / status |
|------|----------------|
| Provider | Supabase (Postgres 17) |
| Project / cluster | `ayc-leadership-workbench` (`yprxjkyjbfhinsassdaw`) · region `us-east-1` |
| Daily backups enabled | ☑ (Supabase managed plan backups) |
| Retention | Per Supabase project plan (confirm in Dashboard → Database → Backups) |
| Last restore drill date | 2026-07-31 — connectivity + health restore path verified via pooler URL; full PITR restore deferred to next maintenance window |
| Console | https://supabase.com/dashboard/project/yprxjkyjbfhinsassdaw |

## What to back up before risky changes

- Run provider snapshot or confirm latest automated backup before migrations.
- Keep `DATABASE_URL` and `AYC_LEADER_WRITE_SECRET` only in Netlify env / local `.env` (never git).
- Application code is recoverable from GitHub `main`.

## Restore procedure (outline)

1. Pause write traffic if needed (Netlify password / temporary maintenance note).
2. Restore database from provider backup to a point in time or snapshot.
3. Confirm `npm run db:migrate` is not required (restored DB already includes schema) **or** re-apply only missing migrations carefully.
4. Re-seed teams only if team rows are missing: `npm run db:seed-teams`.
5. Re-seed roster only if leadership intake list is missing: `npm run db:seed-roster`.
6. Verify `/api/health` reports `database.ok: true` (no error detail in production).
7. Spot-check Leader Board unlock, directory, and one contact record.
8. Resume traffic.

## Rollback of application code

1. Identify last known good commit on `main`.
2. Revert or redeploy prior Netlify deploy (Netlify deploy history).
3. Do **not** force-push secrets or rewrite published history casually.

## Restore tested?

☑ Pooler connectivity + `/api/health` database.ok confirmed after production wiring (2026-07-31)  
☐ Full PITR restore drill on a disposable branch/database (schedule before major schema change)
