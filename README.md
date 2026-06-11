# CVAlign AI

AI-powered resume analysis and job recommendations.

The application lives in [`cvalign/`](cvalign/). See [cvalign/README.md](cvalign/README.md) for features and setup.

## Quick start (local)

From the repository root, you can start the frontend directly:

```bash
npm run dev
```

For the full stack (frontend + backend), use:

```bash
cd cvalign
bash scripts/dev-local.sh
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000 (proxied at `/api` in dev)

## Verify

```bash
# Backend unit tests
cd cvalign/cvalign-ai-backend && . .venv/bin/activate && pytest -q

# Frontend typecheck
cd cvalign/FRONTEND && npm run lint

# Integration (with dev servers running)
bash cvalign/scripts/test-integration.sh
```

Copy `.env.example` to `.env` in `cvalign/cvalign-ai-backend` and `cvalign/FRONTEND` before running locally.
