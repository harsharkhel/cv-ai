import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

_test_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db.name}"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_jwt_signing_only"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
os.environ["JOB_LIVE_SEARCH_ENABLED"] = "false"
os.environ["INTERNSHALA_SOURCE_ENABLED"] = "false"
os.environ["TESTING"] = "true"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    resp = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Password1",
        },
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, db):
    from app.models.user import User, UserRole
    from app.utils.security import hash_password

    admin = User(
        name="Admin",
        email="admin@test.com",
        password_hash=hash_password("AdminPass1"),
        role=UserRole.admin,
        is_email_verified=True,
    )
    db.add(admin)
    db.commit()

    resp = client.post(
        "/auth/login",
        json={"email": "admin@test.com", "password": "AdminPass1"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def recruiter_headers(client, db):
    from app.models.user import User, UserRole
    from app.utils.security import hash_password

    recruiter = User(
        name="Recruiter",
        email="recruiter@test.com",
        password_hash=hash_password("Recruit1"),
        role=UserRole.recruiter,
        is_email_verified=True,
    )
    db.add(recruiter)
    db.commit()

    resp = client.post(
        "/auth/login",
        json={"email": "recruiter@test.com", "password": "Recruit1"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
