# CVAlign Frontend

React + Vite UI for CVAlign resume analysis. Connects to the FastAPI backend via a dev proxy.

## Quick start (with backend)

1. **Backend** (from `cvalign` repo):

   ```bash
   cd "ai agent/cvalign-ai-backend"
   source .venv/bin/activate
   python run.py
   ```

2. **Frontend** (this repo):

   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

3. Open http://localhost:3000 — login footer should show **API Backend: ONLINE**.

See `INTEGRATION.md` in the **cvalign** backend repo for full setup and troubleshooting.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base (`/api` uses Vite proxy → `localhost:8000`) |
| `GEMINI_API_KEY` | Optional; AI Studio / Gemini features |

## Deploy on Vercel

See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for full settings.

Quick summary:

1. **cvalign repo:** Root Directory = `FRONTEND` **or** use repo-root `vercel.json`.
2. **FRONTEND repo:** Root Directory = `.`
3. Framework: **Vite** · Output: **`dist`** · Build: **`npm run build`**
4. `vercel.json` rewrites all routes to `/` for SPA client routing.
5. Set `VITE_API_BASE_URL` to your live FastAPI URL in Vercel env vars.

## Scripts

- `npm run dev` — Vite on port 3000 with `/api` proxy
