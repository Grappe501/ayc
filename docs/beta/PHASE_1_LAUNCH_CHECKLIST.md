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

- [ ] Production Netlify password active
- [ ] Production database confirmed + migrations/seed applied
- [ ] Env vars set (`DATABASE_URL`, `AYC_LEADER_WRITE_SECRET`)
- [ ] Backup retention confirmed / restore drill noted
- [ ] `npm run validate` green on release commit
- [ ] Post-deploy checks in `DEPLOYMENT_VALIDATION.md` completed
- [ ] Test data labeled or removed from production
- [ ] Responsive QA recorded (phone + iPad) via beta script
- [ ] Keyboard / dialog focus smoke test recorded

## Gate 6 decision

| Role | Approve | Date |
|------|---------|------|
| Product owner | ☐ | |
| Technical lead | ☐ | |

**Notes:**
