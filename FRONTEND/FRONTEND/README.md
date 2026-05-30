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

1. Import the **cvalign** repo (or **FRONTEND** repo).
2. Set **Root Directory** to `FRONTEND` (monorepo) or `.` (standalone frontend repo).
3. Framework preset: **Vite**. Output directory: **`dist`** (default).
4. Add environment variables from `.env.example` (especially `VITE_*` — they are baked in at build time).
5. For production, set `VITE_API_BASE_URL` to your live FastAPI URL (not `/api`). The `/api` proxy only exists in `npm run dev`.
6. `vercel.json` rewrites all routes to `index.html` so refreshes and paths like `/auth/callback` do not return 404.

- `npm run build` — production build
- `npm run lint` — TypeScript check
