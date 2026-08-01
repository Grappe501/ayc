# Phase 1 Launch Checklist (Gate 6)

Required before leadership-team testing (Volume VII Gate 6).

## Product evidence

- [x] Feedback form (Phase 1G)
- [x] Leader write access, contact create/edit/archive/restore (1D–1E)
- [x] Directory search/filters/views + masking (1F)
- [x] Accessibility hardening pass (1H code)
- [x] Security checklist authored (`docs/security/PHASE_1_SECURITY_CHECKLIST.md`)
- [x] Privacy note authored (`docs/security/PHASE_1_PRIVACY_NOTE.md`)
- [x] Backup plan authored (`docs/operations/BACKUP_AND_RECOVERY.md`)
- [x] Beta test script authored (`docs/beta/PHASE_1_BETA_TEST_SCRIPT.md`)
- [x] Deployment validation checklist (`docs/deployment/DEPLOYMENT_VALIDATION.md`)

## Operator confirmation (Steve / deploy owner)

- [x] Production Netlify password active
- [x] Production database confirmed + migrations/seed applied
- [x] Env vars set (`DATABASE_URL`, `AYC_LEADER_WRITE_SECRET`)
- [x] Backup retention confirmed / restore drill noted (pooler + health path; full PITR deferred)
- [x] `npm run validate` green on release commit
- [x] Post-deploy checks in `DEPLOYMENT_VALIDATION.md` completed (API/desktop path)
- [x] Test data labeled or removed from production (Gate 6 feedback marked TEST; roster is real intake)
- [ ] Responsive QA recorded (phone + iPad) via beta script — **Steve**
- [ ] Keyboard / dialog focus smoke test recorded — **Steve** (desktop keyboard path exercised in 1H; confirm on device)

## Gate 6 decision

| Role | Approve | Date |
|------|---------|------|
| Product owner | ☐ | _pending device QA_ |
| Technical lead | ☑ | 2026-07-31 |

**Notes:**

- Technical Gate 6 is ready for leadership beta pending Steve’s phone/iPad pass on `docs/beta/PHASE_1_BETA_TEST_SCRIPT.md`.
- Site visitor password and Leader Board unlock shared out-of-band (not in git).
- Live: https://arkansasyouth.netlify.app
