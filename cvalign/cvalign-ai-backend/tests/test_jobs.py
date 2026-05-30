def test_job_search(auth_headers, client, db):
    from app.models.job import Job, JobType, RemoteType

    job = Job(
        source="manual",
        title="Python Intern",
        company="Example Co",
        location="Remote",
        job_type=JobType.internship,
        remote_type=RemoteType.remote,
        description="Python FastAPI internship with SQL skills required.",
        skills_json=["python", "fastapi", "sql"],
        apply_url="https://example.com/apply",
    )
    db.add(job)
    db.commit()

    resp = client.get("/jobs/search?query=Python", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_job_recommendations(auth_headers, client, db):
    from app.models.job import Job, JobType, RemoteType
    from app.models.resume_analysis import ResumeAnalysis
    from app.models.user import User

    user = db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None
    analysis = ResumeAnalysis(
        user_id=user.id,
        resume_filename="r.docx",
        resume_text="Python FastAPI SQL React developer with API experience " * 5,
        job_description="Python developer FastAPI SQL Docker API",
        ats_score=70.0,
        text_similarity_score=70.0,
        skill_match_score=70.0,
        resume_skills_json=["python", "fastapi", "sql"],
        jd_skills_json=["python", "fastapi", "sql", "docker"],
        matched_skills_json=["python", "fastapi", "sql"],
        missing_skills_json=["docker"],
    )
    db.add(analysis)

    job = Job(
        source="manual",
        title="Backend Intern",
        company="Startup",
        description="Python FastAPI SQL internship role",
        skills_json=["python", "fastapi", "sql"],
        job_type=JobType.internship,
        remote_type=RemoteType.remote,
    )
    db.add(job)
    db.commit()

    resp = client.get("/jobs/recommendations", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
