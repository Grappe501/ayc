# Phase 1 Security Checklist

## Secrets

- [ ] `DATABASE_URL` never committed; only Netlify / local `.env`
- [ ] `AYC_LEADER_WRITE_SECRET` never committed
- [ ] `.env` gitignored
- [ ] No `VITE_*` secret variables

## Write access

- [ ] Unlock verifies secret server-side (`leader-unlock`)
- [ ] Write APIs require `X-AYC-Leader-Write-Secret`
- [ ] Wrong/missing code returns generic unauthorized message (no config leakage)
- [ ] Leader unlock rate-limited (in-isolate; ~20 / 15 min / IP)

## Session model (Phase 1)

- Browser stores write secret in `sessionStorage` after unlock for API calls.
- Acceptable only for small trusted beta behind Netlify site password.
- XSS would expose the shared secret — keep CSP + no untrusted HTML, and rotate secret if compromised.
- Phase 2+ should replace shared secret with real accounts.

## HTTP hardening

- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Permissions-Policy disables camera/mic/geo
- [ ] Content-Security-Policy baseline in `netlify.toml`
- [ ] Optional CORS allowlist via `AYC_ALLOWED_ORIGIN`

## API surface

- [ ] Public reads: directory + health + feedback submit
- [ ] Feedback rate-limited (~30 / hour / IP)
- [ ] Production health omits DB error strings
- [ ] Internal errors return generic messages to clients

## Data

- [ ] Directory masks email/phone unless unlock secret present
- [ ] Audit summaries avoid raw phone/email values
- [ ] No youth expansion beyond approved Phase 1 fields without privacy review

## Incident basics

1. Rotate `AYC_LEADER_WRITE_SECRET` in Netlify.
2. Ask leaders to re-unlock (clear session / new code).
3. Review audit_events and beta_feedback for abuse.
4. Restore DB from backup if integrity compromised.
