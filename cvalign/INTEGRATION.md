# Local development — Frontend + Backend

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Proxied API | http://localhost:3000/api/* → localhost:8000 |

## Quick start

**Terminal 1 — Backend**
```bash
cd cvalign-ai-backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit if needed
python3 run.py
```

**Terminal 2 — Frontend**
```bash
cd ../FRONTEND
npm install
cp .env.example .env   # Firebase keys already documented
npm run dev
```

**Or use the helper script (both at once):**
```bash
bash scripts/dev-local.sh
```

## Integration test

With both servers running:
```bash
bash scripts/test-integration.sh
```

Tests: backend health, frontend HTML, Vite `/api` proxy, CORS, register, `/auth/me`, login.

## Localhost configuration

### Backend (`cvalign-ai-backend/.env`)
```
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FIREBASE_PROJECT_ID=your_project_id
```

Development mode auto-allows `localhost:3000`, `127.0.0.1:3000`, and Vite `:5173`.

### Frontend (`FRONTEND/.env`)
```
VITE_API_BASE_URL=/api
APP_URL=http://localhost:3000
VITE_FIREBASE_*=...
```

Vite proxies `/api` → `http://localhost:8000` (see `FRONTEND/vite.config.ts`).

### Firebase Console
Add to **Authentication → Settings → Authorized domains**:
- `localhost`
- `127.0.0.1`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 8000 in use | `lsof -ti :8000 \| xargs kill` then restart backend |
| API OFFLINE on login | Ensure backend is `cvalign-ai-backend`, not an old copy |
| CORS error | Check `ALLOWED_ORIGINS` includes `http://localhost:3000` |
| Google login fails | Enable Google provider + add localhost in Firebase |
