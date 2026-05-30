def test_register(client):
    resp = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "Secure1pass"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert "password_hash" not in data["user"]
    assert "password" not in data["user"]


def test_register_weak_password(client):
    resp = client.post(
        "/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "short"},
    )
    assert resp.status_code == 422


def test_login(client):
    client.post(
        "/auth/register",
        json={"name": "Carol", "email": "carol@example.com", "password": "Password9"},
    )
    resp = client.post(
        "/auth/login",
        json={"email": "carol@example.com", "password": "Password9"},
    )
    assert resp.status_code == 200
    assert resp.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"name": "Dan", "email": "dan@example.com", "password": "Password1"},
    )
    resp = client.post(
        "/auth/login",
        json={"email": "dan@example.com", "password": "WrongPass1"},
    )
    assert resp.status_code == 401


def test_me(auth_headers, client):
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"
