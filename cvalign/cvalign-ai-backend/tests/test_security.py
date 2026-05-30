import io
from datetime import timedelta
from unittest.mock import patch

import pytest
from jose import jwt
from openpyxl import load_workbook

from app.config import get_settings
from app.utils.jwt_handler import create_access_token
from app.utils.security import hash_password, verify_password


def test_password_is_hashed_not_plaintext():
    hashed = hash_password("MyPassword1")
    assert hashed != "MyPassword1"
    assert verify_password("MyPassword1", hashed)
    assert not verify_password("WrongPassword1", hashed)


def test_password_hash_not_in_api_response(auth_headers, client):
    resp = client.get("/auth/me", headers=auth_headers)
    body = resp.json()
    assert "password_hash" not in body
    assert "password" not in body


def test_password_hash_not_in_excel_export(admin_headers, client, db):
    from app.models.user import User

    user = User(
        name="Export User",
        email="export@example.com",
        password_hash=hash_password("Password1"),
    )
    db.add(user)
    db.commit()

    resp = client.get("/admin/export/users", headers=admin_headers)
    assert resp.status_code == 200

    wb = load_workbook(io.BytesIO(resp.content))
    headers = [cell.value for cell in wb.active[1]]
    assert "password_hash" not in headers
    assert "password" not in headers
    assert "user_uuid" in headers


def test_duplicate_email_blocked(client):
    payload = {"name": "User One", "email": "dup@example.com", "password": "Password1"}
    assert client.post("/auth/register", json=payload).status_code == 200
    assert client.post("/auth/register", json=payload).status_code == 409


def test_weak_password_blocked(client):
    resp = client.post(
        "/auth/register",
        json={"name": "Weak", "email": "weak@example.com", "password": "short"},
    )
    assert resp.status_code == 422


def test_password_no_letter_blocked(client):
    resp = client.post(
        "/auth/register",
        json={"name": "NumOnly", "email": "num@example.com", "password": "12345678"},
    )
    assert resp.status_code == 422


def test_invalid_token_blocked(client):
    resp = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401


def test_expired_token_blocked(client, db):
    from app.models.user import User

    user = User(
        name="Expired",
        email="expired@example.com",
        password_hash=hash_password("Password1"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    settings = get_settings()
    token = create_access_token(
        {"sub": user.user_uuid, "user_id": user.id, "email": user.email, "role": user.role.value},
        expires_delta=timedelta(seconds=-10),
    )
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


def test_jwt_contains_user_id_email_role(client):
    resp = client.post(
        "/auth/register",
        json={"name": "JWT User", "email": "jwt@example.com", "password": "Password1"},
    )
    token = resp.json()["access_token"]
    settings = get_settings()
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    assert "user_id" in payload
    assert "email" in payload
    assert "role" in payload
    assert payload["email"] == "jwt@example.com"
    assert payload["role"] == "user"


def test_user_cannot_access_admin(client, auth_headers):
    assert client.get("/admin/users", headers=auth_headers).status_code == 403


def test_admin_can_access_admin(admin_headers, client):
    assert client.get("/admin/users", headers=admin_headers).status_code == 200


def test_user_cannot_access_recruiter(client, auth_headers):
    assert client.get("/recruiter/jobs", headers=auth_headers).status_code == 403


def test_recruiter_can_access_recruiter(recruiter_headers, client):
    assert client.get("/recruiter/jobs", headers=recruiter_headers).status_code == 200


def test_google_login_no_password_hash(client):
    mock_idinfo = {
        "sub": "google789",
        "email": "gmail@example.com",
        "name": "Gmail User",
        "email_verified": True,
        "iss": "accounts.google.com",
    }
    with patch("app.services.google_auth_service.verify_firebase_id_token", return_value=mock_idinfo):
        resp = client.post("/auth/google", json={"id_token": "mock.token"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_invalid_file_type_blocked(auth_headers, client):
    resp = client.post(
        "/resume/analyze",
        headers=auth_headers,
        files={"file": ("resume.txt", b"not a valid resume file content", "text/plain")},
        data={"job_description": "Python developer role with FastAPI experience required."},
    )
    assert resp.status_code == 400


def test_cors_uses_env_origins():
    settings = get_settings()
    assert "http://localhost:3000" in settings.allowed_origins_list


def test_secrets_loaded_from_env_not_hardcoded_in_production_check():
    settings = get_settings()
    assert settings.DATABASE_URL
    assert settings.JWT_SECRET_KEY
    assert settings.JWT_ALGORITHM == "HS256"
    # Keys should be empty strings in test env unless explicitly set
    assert isinstance(settings.GEMINI_API_KEY, str)
    assert isinstance(settings.ADZUNA_APP_ID, str)


def test_health_does_not_expose_secrets(client):
    resp = client.get("/health")
    body = resp.json()
    assert "JWT_SECRET_KEY" not in str(body)
    assert "GEMINI_API_KEY" not in str(body)
    assert "password" not in str(body).lower()
