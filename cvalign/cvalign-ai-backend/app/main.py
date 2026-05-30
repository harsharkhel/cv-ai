from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.routes import admin_routes, auth_routes, chat_routes, dashboard_routes, job_routes, recruiter_routes, resume_routes
from app.services.auth_service import seed_admin_if_configured
from app.utils.error_handlers import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.utils.rate_limiter import limiter

settings = get_settings()

CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_HEADERS = ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_production and settings.JWT_SECRET_KEY == "change_this_secret_key":
        raise RuntimeError("JWT_SECRET_KEY must be changed in production")
    init_db()
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    db = SessionLocal()
    try:
        seed_admin_if_configured(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
    finally:
        db.close()
    yield


app = FastAPI(
    title="CVAlign AI API",
    description="AI Resume Analyzer + Job Recommendation Backend",
    version="1.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=CORS_METHODS,
    allow_headers=CORS_HEADERS,
)

app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(resume_routes.router)
app.include_router(job_routes.router)
app.include_router(chat_routes.router)
app.include_router(admin_routes.router)
app.include_router(recruiter_routes.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.ENV,
        "cors_origins_count": len(settings.allowed_origins_list),
        "openai": bool(settings.OPENAI_API_KEY),
    }
