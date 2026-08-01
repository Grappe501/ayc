# BUILD RETURN — Playwright smoke (#5 / WS-L)

**Date:** 2026-08-01  
**Slice:** V3 immediate #5 — Playwright smoke for public + master paths

## Done

1. **Migration 015 applied** on production Supabase — `team_tasks.location_id` + `team_resources.location_id` (nullable uuid).
2. **Playwright smoke suite** (`e2e/smoke.spec.ts`)
   - Public: `/`, `/join`, `/directory`, `/calendar`, `/feedback`
   - Master: unlock `/leader` with break-glass key → Leader Board
   - One board: `/leader/teams/organizer` after unlock
3. Config: `playwright.config.ts` (default base URL production Netlify)
4. Scripts: `npm run test:e2e` / `test:e2e:smoke`
5. Browsers on `H:\playwright-browsers` (drive protocol)

## How to run

```bash
set PLAYWRIGHT_BROWSERS_PATH=H:\playwright-browsers
set AYC_E2E_MASTER_KEY=<master key>
npm run test:e2e:smoke
```

Optional: `PLAYWRIGHT_BASE_URL` for a preview deploy.

## Validation

`npm run test:e2e:smoke` — **7 passed** against https://arkansasyouth.netlify.app (2026-08-01).

## Boundaries

- Does not submit join applications (no prod data pollution)
- Does not replace unit/`validate` suite
- Master key never committed — read from env only
