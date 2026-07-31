# Arkansas Youth Coalition — Leadership Workbench

Protected leadership workspace for the Arkansas Youth Coalition.

- **Local path:** `H:\AYC`
- **GitHub:** https://github.com/Grappe501/ayc
- **Hosting:** Netlify (connect this repo, branch `main`)
- **Stack:** React · TypeScript · Vite · React Router · Netlify Functions · PostgreSQL (Phase 1C+)

## Quick start

```bash
npm install
npm run validate
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`).

## Routes (Phase 1)

| Path | Purpose |
|------|---------|
| `/` | Vision landing + canonical mission |
| `/leader` | Leader Board (contact entry in later slices) |
| `/directory` | Leadership Directory |
| `/feedback` | Beta feedback |
| `/.netlify/functions/health` | Health check |

## Environment

Copy `.env.example` to `.env` locally. Configure the same names in Netlify:

- `DATABASE_URL`
- `AYC_LEADER_WRITE_SECRET`
- `AYC_ENVIRONMENT`
- `AYC_SITE_NAME`

Never commit secrets or personal contact data.

## Governing docs

See `docs/master-build-plan/`.
