# Vercel deployment (CVAlign frontend)

## Correct frontend root

| Git repository | Vercel **Root Directory** | `package.json` location |
|----------------|---------------------------|-------------------------|
| `harsharkhel/cvalign` | `FRONTEND` **or** leave empty and use root `vercel.json` | `FRONTEND/package.json` |
| `harsharkhel/FRONTEND` | `.` (repo root) | `package.json` at repo root |

## Vercel project settings

Use **one** of these setups (not both):

### Option A — Monorepo subfolder (recommended)

- **Root Directory:** `FRONTEND`
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (override off; use `FRONTEND/vercel.json`)
- **Output Directory:** `dist` (override off)
- **Install Command:** `npm install`

### Option B — Monorepo repo root

- **Root Directory:** empty / `.`
- Uses `/vercel.json` at repo root → builds `FRONTEND/` and serves `FRONTEND/dist`

### Remove wrong overrides

In Vercel → Settings → General → Build & Development:

- Do **not** set Output to `build`, `public`, or `frontend/dist`
- Do **not** point Root Directory at `cvalign-ai-backend`
- Turn off **Override** for Output Directory unless you know it must be `dist`

## Environment variables (Production)

```
VITE_API_BASE_URL=https://YOUR-BACKEND-URL.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

`/api` only works with `npm run dev` (Vite proxy). Production must use the real backend URL.

## Redeploy

```bash
git add FRONTEND/vercel.json vercel.json FRONTEND/vite.config.ts
git commit -m "Fix Vercel SPA routing and monorepo build output"
git push origin main
```

Then in Vercel: **Deployments** → latest → **Redeploy** (enable “Use existing Build Cache” **off** once).

## Test checklist

- [ ] `https://YOUR-APP.vercel.app/` loads the app (not Vercel 404 page)
- [ ] `https://YOUR-APP.vercel.app/auth/callback` loads the app
- [ ] Hard refresh on any client route still works
- [ ] Network tab: API calls go to your FastAPI host, not `your-app.vercel.app/api`
- [ ] Build logs show `dist/index.html` created
