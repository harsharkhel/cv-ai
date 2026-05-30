from unittest.mock import patch

from app.services.google_auth_service import google_login


def test_google_login_mock(db):
    mock_idinfo = {
        "sub": "google123",
        "email": "google@example.com",
        "name": "Google User",
        "picture": "https://example.com/pic.jpg",
        "email_verified": True,
        "iss": "accounts.google.com",
    }

    with patch("app.services.google_auth_service.verify_firebase_id_token", return_value=mock_idinfo):
        with patch("app.services.google_auth_service.settings") as mock_settings:
            mock_settings.GOOGLE_CLIENT_ID = "test-client-id"
            user, token = google_login(db, "fake-token", "127.0.0.1", "pytest")
            assert user.email == "google@example.com"
            assert user.google_sub == "google123"
            assert user.password_hash is None
            assert token


def test_google_login_endpoint(client):
    mock_idinfo = {
        "sub": "google456",
        "email": "guser@example.com",
        "name": "G User",
        "email_verified": True,
        "iss": "accounts.google.com",
    }

    with patch("app.services.google_auth_service.verify_firebase_id_token", return_value=mock_idinfo):
        resp = client.post("/auth/google", json={"id_token": "valid.mock.token"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()
