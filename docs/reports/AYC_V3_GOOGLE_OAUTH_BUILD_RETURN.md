# BUILD RETURN — Google OAuth (#7 / WS-A6)

**Date:** 2026-08-03  
**Slice:** V3 immediate #7 — optional Google OAuth (invite-gated)

## Done

1. Login **Continue with Google** (hide with `VITE_AYC_GOOGLE_OAUTH=false`)
2. `/auth/callback` — finishes session + calls `POST /api/account-oauth-bind`
3. Server bind rules (no open signup):
   - `user_accounts.auth_subject` match → ok
   - email match → rebind subject (Google becomes login)
   - open unused invite for email → claim via Google
   - else → delete orphan Auth user + 403
4. Docs: routes, boundaries, Supabase redirect + Google provider setup

## Operator steps

1. Supabase → Auth → Providers → **Google** on (client ID/secret from Google Cloud)
2. Redirect allowlist: `…/auth/callback` (prod + local)
3. Confirm Netlify has `SUPABASE_SERVICE_ROLE_KEY` + `VITE_SUPABASE_*`

## Boundaries

- Still invite-only (no public signup)
- No Apple / other social providers
- Notify Chance still deferred
