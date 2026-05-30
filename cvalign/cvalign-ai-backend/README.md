# CVAlign AI Backend

FastAPI backend for CVAlign AI — resume analysis, ATS-style matching, job recommendations, and AI chatbot.

## Tech Stack

- FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod)
- JWT authentication with role-based access control
- bcrypt password hashing
- Google OAuth ID token verification
- SlowAPI rate limiting
- OpenAI / Gemini for AI analysis

## Quick Start

```bash
cd cvalign-ai-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — change JWT_SECRET_KEY before production
python run.py
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

## Environment Variables

Copy `.env.example` to `.env`. **Never commit `.env`.**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite or PostgreSQL connection string |
| `JWT_SECRET_KEY` | Signing key for access tokens (required in production) |
| `GOOGLE_CLIENT_ID` | Google Sign-In token verification |
| `GEMINI_API_KEY` | Gemini AI analysis |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Adzuna job API (optional) |
| `JOOBLE_API_KEY` | Jooble job API (optional) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `FRONTEND_URL` | Primary frontend URL (auto-added to CORS) |

Optional admin seed:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass1
```

## Security Architecture

### Authentication

- **Email/password**: bcrypt-hashed `password_hash` only; never returned in API or Excel
- **Google OAuth**: frontend sends ID token; backend verifies via Google; `password_hash = null`
- **JWT payload**: `sub` (user_uuid), `user_id`, `email`, `role`, `exp`

### Role Dependencies

| Dependency | Allowed roles |
|------------|---------------|
| `get_current_user` | Any authenticated active user |
| `require_admin` | admin |
| `require_recruiter` | recruiter, admin |
| `require_admin_or_recruiter` | admin, recruiter |

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 5/min per IP |
| `POST /auth/register` | 3/min per IP |
| `POST /resume/analyze` | 10/min per user |
| `GET /jobs/search` | 30/min per IP |
| `POST /chat` | 20/min per user |

Returns **429** when exceeded.

### CORS — Dev vs Production

**Development** (`ENV=development`):

```env
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Production** (`ENV=production`):

```env
ENV=production
JWT_SECRET_KEY=<strong-random-secret>
ALLOWED_ORIGINS=https://cvalignai.com,https://www.cvalignai.com
FRONTEND_URL=https://cvalignai.com
```

- Never use `allow_origins=["*"]` in production
- Only required methods/headers are allowed (GET, POST, PUT, PATCH, DELETE, OPTIONS + Authorization, Content-Type, etc.)

### Excel Export Rules

Admin exports never include: `password`, `password_hash`, JWT, Google tokens, or API keys.

## Protected Endpoints

### Auth (public + authenticated)

- `POST /auth/register`, `/auth/login`, `/auth/google`
- `GET /auth/me`, `POST /auth/logout` (requires JWT)

### User (requires login)

- `POST /resume/analyze`, `GET /resume/history`, etc.

### Admin (requires admin role)

- `GET /admin/users`, `/admin/login-logs`, `/admin/export/*`

### Recruiter (requires recruiter or admin)

- `GET /recruiter/jobs`, `/recruiter/candidates`
- `POST /recruiter/job-posts`

## Tests

```bash
PYTHONPATH=. TESTING=true pytest tests/ -v
```

Security tests cover: password hashing, JWT claims, role enforcement, Google login, invalid/expired tokens, duplicate email, weak passwords, file validation, CORS config, and secret non-exposure.

## PostgreSQL & Migrations

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cvalign_ai
```

For production, use Alembic instead of `create_all`:

```bash
pip install alembic
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Dev mode still auto-creates tables on startup via `init_db()`.

## Job API Sources

When configured in `.env`, live search uses official APIs in this order:

1. **Adzuna** — `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY` (e.g. `gb`, `us`, `in`)
2. **Jooble** — `JOOBLE_API_KEY`
3. **Google Programmable Search** — optional fallback
4. **Internshala** — disabled by default

Set `JOB_LIVE_SEARCH_ENABLED=false` to search only the local database.
