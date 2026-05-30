import io

from docx import Document


def _make_docx() -> bytes:
    doc = Document()
    doc.add_paragraph(
        "John Doe - Software Engineer with Python, FastAPI, SQL, React, "
        "JavaScript experience. Built APIs and web applications. "
        "Led team projects and improved performance by 40 percent."
    )
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_resume_analyze(auth_headers, client):
    docx_bytes = _make_docx()
    resp = client.post(
        "/resume/analyze",
        headers=auth_headers,
        files={"file": ("resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={
            "job_description": "Looking for Python developer with FastAPI, SQL, Docker skills and API experience.",
            "job_title": "Python Developer",
            "company_name": "Tech Co",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "ats_score" in data
    assert 0 <= data["ats_score"] <= 100
    assert "matched_skills" in data
    assert "final_summary" in data


def test_resume_history(auth_headers, client):
    docx_bytes = _make_docx()
    client.post(
        "/resume/analyze",
        headers=auth_headers,
        files={"file": ("resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={"job_description": "Python FastAPI developer role with SQL and React."},
    )
    resp = client.get("/resume/history", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_user_cannot_access_other_analysis(auth_headers, client, db):
    from app.models.resume_analysis import ResumeAnalysis
    from app.models.user import User
    from app.utils.security import hash_password

    other = User(name="Other", email="other@example.com", password_hash=hash_password("Password1"))
    db.add(other)
    db.commit()

    analysis = ResumeAnalysis(
        user_id=other.id,
        resume_filename="other.docx",
        resume_text="Other user resume text " * 10,
        job_description="Job description for other user role.",
        ats_score=50.0,
        text_similarity_score=50.0,
        skill_match_score=50.0,
    )
    db.add(analysis)
    db.commit()

    resp = client.get(f"/resume/analysis/{analysis.id}", headers=auth_headers)
    assert resp.status_code == 404
