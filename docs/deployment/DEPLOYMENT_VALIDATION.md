# Deployment Validation — Phase 1

Production site: https://arkansasyouth.netlify.app  
Admin: https://app.netlify.com/projects/arkansasyouth/overview  
Repo: https://github.com/Grappe501/ayc (`main`)

## Pre-deploy

- [ ] `npm run validate` passes locally (typecheck, lint, test, build)
- [ ] No secrets or PII in the commit
- [ ] Migrations reviewed if schema changed

## Netlify environment

- [ ] `DATABASE_URL` set (server-only)
- [ ] `AYC_LEADER_WRITE_SECRET` set (server-only)
- [ ] `AYC_ENVIRONMENT=production` (recommended)
- [ ] Optional `AYC_ALLOWED_ORIGIN=https://arkansasyouth.netlify.app` for explicit CORS
- [ ] Site password / visitor access control active for beta (Steve configures)

## Post-deploy checks (Vol VII §28)

- [ ] Home `/` loads (HTTP 200)
- [ ] SPA deep link `/directory` loads (not 404 from host)
- [ ] `/api/health` returns `{ ok: true }` and `database.ok` when DB configured
- [ ] Health response does **not** expose raw DB errors in production
- [ ] Leader unlock rejects wrong code with generic message
- [ ] Leader unlock accepts correct code
- [ ] Create location + contact (if DB seeded)
- [ ] Directory people/teams/locations respond
- [ ] Contact masking for visitors without unlock
- [ ] Feedback submit returns `AYC-FB-######` reference
- [ ] Mobile viewport: nav menu, FAB does not cover primary actions

## Database bootstrap (first environment)

```bash
npm run db:migrate
npm run db:seed-teams
```

## Sign-off

| Check | By | Date |
|-------|----|------|
| Build validation | | |
| Production password | | |
| Production database | | |
