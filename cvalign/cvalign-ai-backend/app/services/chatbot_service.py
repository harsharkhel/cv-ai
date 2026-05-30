from typing import Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.ai_chat_message import AIChatMessage
from app.models.job import Job
from app.models.job_recommendation import JobRecommendation
from app.models.resume_analysis import ResumeAnalysis
from app.services.ai_analysis_service import _call_openai
from app.services.dashboard_service import refresh_dashboard_snapshot

settings = get_settings()

UPLOAD_FIRST_MESSAGE = (
    "Please upload your resume and paste a job description first "
    "so I can give personalized answers."
)

CHAT_SYSTEM = """You are CVAlign AI career assistant. Answer using ONLY the context provided.
Rules:
- Do not guarantee job selection or rejection.
- Do not fabricate job URLs, companies, or salaries not in context.
- If information is missing, say it is missing.
- Be helpful about resume improvements, skills, and job fit.
- Refer to scores as ATS-style match scores, not guarantees."""


def build_context(
    db: Session,
    user_id: int,
    resume_analysis_id: Optional[int] = None,
    job_id: Optional[int] = None,
) -> dict:
    ctx = {"has_resume_analysis": False, "has_job": False, "recommendations": []}

    analysis_q = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user_id)
    if resume_analysis_id:
        analysis = analysis_q.filter(ResumeAnalysis.id == resume_analysis_id).first()
    else:
        analysis = analysis_q.order_by(ResumeAnalysis.created_at.desc()).first()

    if analysis:
        ctx["has_resume_analysis"] = True
        ctx["analysis_id"] = analysis.id
        ctx["ats_score"] = analysis.ats_score
        ctx["fit_level"] = (analysis.suggestions_json or {}).get("fit_level")
        ctx["missing_skills"] = analysis.missing_skills_json or []
        ctx["matched_skills"] = analysis.matched_skills_json or []
        ctx["resume_snippet"] = analysis.resume_text[:1500]
        ctx["job_description_snippet"] = analysis.job_description[:1500]
        ctx["final_summary"] = analysis.final_summary or (analysis.suggestions_json or {}).get(
            "final_summary", ""
        )

    if job_id:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            ctx["has_job"] = True
            ctx["job"] = {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description[:2000],
                "skills": job.skills_json or [],
                "apply_url": job.apply_url,
            }

    recs = (
        db.query(JobRecommendation)
        .filter(JobRecommendation.user_id == user_id)
        .order_by(JobRecommendation.created_at.desc())
        .limit(5)
        .all()
    )
    for rec in recs:
        job = db.query(Job).filter(Job.id == rec.job_id).first()
        if job:
            ctx["recommendations"].append(
                {
                    "title": job.title,
                    "company": job.company,
                    "match_score": rec.match_score,
                }
            )

    return ctx


def _generate_response(message: str, context: dict) -> str:
    if not context.get("has_resume_analysis"):
        return UPLOAD_FIRST_MESSAGE

    if not settings.OPENAI_API_KEY:
        return (
            "I have your resume analysis context, but AI chat is unavailable because "
            "OPENAI_API_KEY is not configured on the server. Review your analysis "
            "dashboard for scores, matched skills, and missing skills."
        )

    context_str = str({k: v for k, v in context.items() if k != "resume_snippet"})[:6000]
    resume_snippet = context.get("resume_snippet", "")[:2000]
    jd_snippet = context.get("job_description_snippet", "")[:2000]
    prompt = (
        f"{CHAT_SYSTEM}\n\n"
        f"Resume excerpt:\n{resume_snippet}\n\n"
        f"Job description excerpt:\n{jd_snippet}\n\n"
        f"Context:\n{context_str}\n\n"
        f"User question: {message}"
    )

    raw = _call_openai(prompt)
    if raw:
        return raw.strip()

    return (
        "I could not generate an AI response right now. Please review your latest "
        "analysis scores and skill gaps on the dashboard."
    )


def chat(
    db: Session,
    user_id: int,
    message: str,
    resume_analysis_id: Optional[int] = None,
    job_id: Optional[int] = None,
) -> tuple[AIChatMessage, dict]:
    if resume_analysis_id:
        analysis = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.id == resume_analysis_id, ResumeAnalysis.user_id == user_id)
            .first()
        )
        if not analysis:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    if job_id:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    context = build_context(db, user_id, resume_analysis_id, job_id)
    safe_context = {k: v for k, v in context.items() if k not in ("resume_snippet",)}
    safe_context["resume_available"] = context.get("has_resume_analysis", False)

    ai_response = _generate_response(message, context)

    record = AIChatMessage(
        user_id=user_id,
        resume_analysis_id=resume_analysis_id or context.get("analysis_id"),
        job_id=job_id,
        user_message=message,
        ai_response=ai_response,
        context_used_json=safe_context,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    refresh_dashboard_snapshot(db, user_id)

    return record, safe_context
