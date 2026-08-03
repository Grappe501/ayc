# BUILD RETURN — Access audit log (#8 / WS-A8)

**Date:** 2026-08-03  
**Slice:** V3 immediate #8 — access audit log

## Done

1. `BOARD_UNLOCKED` audit on successful leader key unlock (migration `016`)
2. `ACCOUNT_LOGIN` audit on `/api/account-me` when last login was stale (>30m)
3. Existing events already covered: claim, invite, application accept/decline, role grant/revoke
4. `GET /api/leader-access-log` — master key or `LEAD_ORGANIZER` only
5. UI: `/leader/access-log` + links from Leader Board and Reports

## Apply migration

`016_access_audit_board_unlocked.sql` must run on production Postgres (adds `BOARD_UNLOCKED` to audit check + partial index).

## Boundaries

- No failed-unlock spam log in this slice
- Category keys cannot open the access log
- Unlock still succeeds if audit insert fails
