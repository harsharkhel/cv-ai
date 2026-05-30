def test_recruiter_job_post(recruiter_headers, client):
    resp = client.post(
        "/recruiter/job-posts",
        headers=recruiter_headers,
        json={
            "title": "Backend Intern",
            "company": "CVAlign Labs",
            "location": "Remote",
            "description": "Python FastAPI internship for students with API experience.",
            "job_type": "internship",
            "remote_type": "remote",
            "skills": ["python", "fastapi"],
            "apply_url": "https://example.com/apply",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["title"] == "Backend Intern"
