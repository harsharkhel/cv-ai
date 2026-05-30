def test_admin_route_protection(auth_headers, client):
    resp = client.get("/admin/users", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_users(admin_headers, client):
    resp = client.get("/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    assert "users" in resp.json()
