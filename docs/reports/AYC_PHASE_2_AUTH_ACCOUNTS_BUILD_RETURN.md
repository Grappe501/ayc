# BUILD RETURN — Phase 2 Personal Login (AUTH)

**Date:** 2026-08-01  
**Slice:** `AYC-PHASE-2-AUTH-ACCOUNTS`

## Done

- Schema: `user_accounts`, `account_invites` (`013_user_accounts.sql`) — applied on Supabase
- Invite/claim-only flow: leader **Invite to login** → one-time code → `/claim` → Supabase Auth user + `user_accounts`
- `/login`, AppShell Log in / My profile / Log out
- `GET /api/account-me` (Bearer JWT), `POST /api/account-invite`, `POST /api/account-claim`
- Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Boundaries

- No open signup; no Google/social OAuth
- Shared leader keys still unlock `/leader/*` boards
- Service role never shipped to the browser

## Ops follow-up

Set Netlify env vars for Supabase Auth (URL, anon key, service role). Enable Email provider in Supabase Auth dashboard if not already on.
