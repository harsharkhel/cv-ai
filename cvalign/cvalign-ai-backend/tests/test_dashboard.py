def test_new_user_dashboard_zero_state(auth_headers, client):
    resp = client.get("/dashboard", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_resumes_analyzed"] == 0
    assert data["average_score"] == 0
    assert data["total_jobs_recommended"] == 0
    assert data["total_chats"] == 0
    assert data["latest_resume_analysis"] is None
    assert data["latest_score"] is None
    assert data["matched_skills"] == []
    assert data["missing_skills"] == []
    assert data["job_recommendations"] == []
    assert data["graph_data"] == []
    assert "Upload your resume" in data["message"]


def test_new_user_no_fake_resume_history(auth_headers, client):
    resp = client.get("/resume/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["analyses"] == []


def test_new_user_job_recommendations_empty(auth_headers, client):
    resp = client.get("/jobs/recommendations", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommendations"] == []
    assert "Upload your resume" in data["message"]


def test_new_user_chat_upload_first(auth_headers, client):
    resp = client.post(
        "/chat",
        headers=auth_headers,
        json={"message": "How can I improve my resume?"},
    )
    assert resp.status_code == 200
    assert "upload your resume" in resp.json()["ai_response"].lower()


def test_new_user_chat_history_empty(auth_headers, client):
    resp = client.get("/chat/history", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["messages"] == []


def test_signup_creates_zero_dashboard_snapshot(client):
    resp = client.post(
        "/auth/register",
        json={
            "name": "Zero User",
            "email": "zero@example.com",
            "password": "Password1",
        },
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash = client.get("/dashboard", headers=headers).json()
    assert dash["total_resumes_analyzed"] == 0
    assert dash["graph_data"] == []

    assert "password_hash" not in resp.json()["user"]
    assert "password" not in resp.json()["user"]
