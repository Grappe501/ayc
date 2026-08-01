# Privacy Note (Phase 1 + personal accounts)

## Purpose

Document what the Leadership Workbench collects during the protected beta and how it is protected.

## Data categories

| Category | Examples | Purpose |
|----------|----------|---------|
| Identity | First/preferred/last name | Directory and contact ops |
| Contact | Email, mobile phone | Reach leaders/volunteers |
| Org context | Location, team, position, status | Coordination |
| Account | Email login (Supabase Auth), `user_accounts` link to person | Personal login / profile ownership |
| Profile | Hometown, major, interests, narrative, photo | Directory Profiles |
| Profile notes | Public or private notes on a person page | Peer / leader encouragement and private coaching |
| Feedback | Description, optional name/contact, page path, browser context | Improve the Workbench |
| Audit | Event type, actor label, change summary | Accountability |

## What we do **not** collect

- Google / social OAuth profiles
- Bulk messaging consent systems
- Event attendance systems
- AI-inferred profiles
- Government IDs, medical, school discipline, or sensitive family data

Any expansion of youth data collection requires a dedicated privacy/legal review slice (Volume VII).

## Access model

- Site is intended to sit behind Netlify visitor password during beta.
- Directory visitors see **masked** contact values unless they unlock Leader Board write access.
- Leader write access uses shared hierarchical keys (still required for `/leader/*` boards).
- Personal accounts are **invite/claim only** (no open signup). Accounts link to an existing `people` row.
- Public profile notes are visible on the directory person page; **private** notes are visible only to the profile owner and unlocked leaders.
- Profile photos are stored in Supabase Storage bucket `profile-photos` (public read URL).

## Feedback privacy

- Reporter name and follow-up contact are optional.
- Browser context (user agent, viewport, language, timezone) is stored to debug mobile/accessibility issues.
- Feedback should not be pasted into public channels with personal contact details.

## Retention

- Operational contacts retained while useful for AYC leadership coordination.
- Archived people remain for history and duplicate prevention.
- Disabled accounts retain the link for audit; auth subject may be revoked in Supabase Auth.
- Provider backups retain data per backup retention window.

## Contact for questions

AYC leadership / Steve for beta privacy questions.
