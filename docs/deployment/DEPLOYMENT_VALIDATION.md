# Deployment Validation — Phase 1

Production site: https://arkansasyouth.netlify.app  
Admin: https://app.netlify.com/projects/arkansasyouth/overview  
Repo: https://github.com/Grappe501/ayc (`main`)

## Pre-deploy

- [x] `npm run validate` passes locally (typecheck, lint, test, build) — 2026-07-31 Gate 6
- [x] No secrets or PII in the commit
- [x] Migrations reviewed if schema changed

## Netlify environment

- [x] `DATABASE_URL` set (server-only)
- [x] `AYC_LEADER_WRITE_SECRET` set (server-only)
- [x] `AYC_ENVIRONMENT=production` (recommended)
- [x] Optional `AYC_ALLOWED_ORIGIN=https://arkansasyouth.netlify.app` for explicit CORS
- [x] Site password / visitor access control active for beta

Credentials are **not** stored in git. Share site visitor password + Leader Board unlock out-of-band (Steve / `.env` / Netlify env). Confirmed set 2026-07-31.

## Post-deploy checks (Vol VII §28)

- [x] Home `/` loads (HTTP 200) behind site password
- [x] SPA deep link `/directory` loads (not 404 from host)
- [x] `/api/health` returns `{ ok: true }` and `database.ok: true`
- [x] Health response does **not** expose raw DB errors in production
- [x] Leader unlock rejects wrong code with generic message
- [x] Leader unlock accepts correct code
- [x] Create location + contact (DB seeded — 50 roster people; create path exercised in 1D–1E)
- [x] Directory people/teams/locations respond (`/api/directory` ok)
- [x] Contact masking for visitors without unlock (1F shipped)
- [x] Feedback submit returns `AYC-FB-######` reference (`AYC-FB-031620` Gate 6 smoke TEST)
- [ ] Mobile viewport: nav menu, FAB does not cover primary actions — **owner device QA**

## Database bootstrap (first environment)

```bash
npm run db:migrate
npm run db:seed-teams
npm run db:seed-roster
```

Applied: teams + 50-person leadership roster (contact gaps intentional).

## Sign-off

| Check | By | Date |
|-------|----|------|
| Build validation | Technical lead (agent) | 2026-07-31 |
| Production password | Technical lead (agent) | 2026-07-31 |
| Production database | Technical lead (agent) | 2026-07-31 |
| Device QA (phone + iPad) | Product owner | _pending_ |
