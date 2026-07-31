# Phase 1 Privacy Note

## Purpose

Document what the Leadership Workbench collects during the protected beta and how it is protected.

## Data categories

| Category | Examples | Purpose |
|----------|----------|---------|
| Identity | First/preferred/last name | Directory and contact ops |
| Contact | Email, mobile phone | Reach leaders/volunteers |
| Org context | Location, team, position, status | Coordination |
| Feedback | Description, optional name/contact, page path, browser context | Improve the Workbench |
| Audit | Event type, actor label, change summary | Accountability |

## What we do **not** collect in Phase 1

- User accounts / OAuth profiles
- Bulk messaging consent systems
- Event attendance systems
- AI-inferred profiles
- Government IDs, medical, school discipline, or sensitive family data

Any expansion of youth data collection requires a dedicated privacy/legal review slice (Volume VII).

## Access model

- Site is intended to sit behind Netlify visitor password during beta.
- Directory visitors see **masked** contact values unless they unlock Leader Board write access.
- Leader write access uses a shared secret (operational convenience for Phase 1 only).

## Feedback privacy

- Reporter name and follow-up contact are optional.
- Browser context (user agent, viewport, language, timezone) is stored to debug mobile/accessibility issues.
- Feedback should not be pasted into public channels with personal contact details.

## Retention

- Operational contacts retained while useful for AYC leadership coordination.
- Archived people remain for history and duplicate prevention.
- Provider backups retain data per backup retention window.

## Contact for questions

AYC leadership / Steve for beta privacy questions during Phase 1.
