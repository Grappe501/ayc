# BUILD RETURN — Password recovery (#6 / WS-A7)

**Date:** 2026-08-01  
**Slice:** V3 immediate #6 — password recovery for invite accounts

## Done

1. `/forgot-password` — request reset email (generic success; no email enumeration)
2. `/reset-password` — set new password when recovery session is present
3. Login page link: **Forgot password**
4. `authSession.requestPasswordReset` / `updatePassword` via Supabase Auth
5. AuthProvider ready-state covers `PASSWORD_RECOVERY` / `INITIAL_SESSION`
6. Docs: route inventory, boundary register, deployment redirect allowlist, V3 checklist #6
7. Smoke: forgot-password page load

## Operator step (required once)

Supabase → Authentication → URL configuration — allowlist:

- `https://arkansasyouth.netlify.app/reset-password`
- `http://localhost:5173/reset-password`

## Boundaries

- Invite/claim only — no public signup
- No Google OAuth (still deferred)
- No custom branded email template yet (uses Supabase default until Notify/email pack)
