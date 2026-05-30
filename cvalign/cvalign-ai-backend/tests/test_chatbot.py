def test_chat(auth_headers, client, db):
    from app.models.resume_analysis import ResumeAnalysis
    from app.models.user import User

    user = db.query(User).filter(User.email == "test@example.com").first()
    analysis = ResumeAnalysis(
        user_id=user.id,
        resume_filename="c.docx",
        resume_text="Python developer resume " * 20,
        job_description="Python FastAPI role",
        ats_score=65.0,
        text_similarity_score=60.0,
        skill_match_score=70.0,
        missing_skills_json=["docker"],
        suggestions_json={"final_summary": "Moderate fit"},
    )
    db.add(analysis)
    db.commit()

    resp = client.post(
        "/chat",
        headers=auth_headers,
        json={"message": "Why is my score low?", "resume_analysis_id": analysis.id},
    )
    assert resp.status_code == 200
    assert "ai_response" in resp.json()
    assert len(resp.json()["ai_response"]) > 0


def test_chat_history(auth_headers, client):
    client.post("/chat", headers=auth_headers, json={"message": "Hello career assistant"})
    resp = client.get("/chat/history", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1
