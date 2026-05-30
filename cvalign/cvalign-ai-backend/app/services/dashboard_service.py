from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ai_chat_message import AIChatMessage
from app.models.dashboard_snapshot import DashboardSnapshot
from app.models.job import Job
from app.models.job_recommendation import JobRecommendation
from app.models.resume_analysis import ResumeAnalysis

ZERO_STATE_MESSAGE = (
    "Upload your resume and paste a job description to start analysis."
)


def create_dashboard_snapshot(db: Session, user_id: int) -> DashboardSnapshot:
    existing = (
        db.query(DashboardSnapshot).filter(DashboardSnapshot.user_id == user_id).first()
    )
    if existing:
        return existing

    snapshot = DashboardSnapshot(
        user_id=user_id,
        total_resumes_analyzed=0,
        average_score=0.0,
        total_jobs_recommended=0,
        total_chats=0,
        graph_data_json=[],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def _build_graph_data(analyses: list[ResumeAnalysis]) -> list[dict]:
    points = []
    for analysis in sorted(analyses, key=lambda a: a.created_at):
        label = analysis.job_title or analysis.resume_filename or f"Analysis {analysis.id}"
        points.append(
            {
                "analysis_id": analysis.id,
                "label": label,
                "score": round(analysis.ats_score, 2),
                "created_at": analysis.created_at.isoformat() if analysis.created_at else "",
            }
        )
    return points


def refresh_dashboard_snapshot(db: Session, user_id: int) -> DashboardSnapshot:
    snapshot = create_dashboard_snapshot(db, user_id)

    analyses = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == user_id)
        .order_by(ResumeAnalysis.created_at.asc())
        .all()
    )
    total_analyses = len(analyses)
    avg_score = (
        round(sum(a.ats_score for a in analyses) / total_analyses, 2) if analyses else 0.0
    )

    total_recs = (
        db.query(func.count(JobRecommendation.id))
        .filter(JobRecommendation.user_id == user_id)
        .scalar()
        or 0
    )
    total_chats = (
        db.query(func.count(AIChatMessage.id))
        .filter(AIChatMessage.user_id == user_id)
        .scalar()
        or 0
    )

    snapshot.total_resumes_analyzed = total_analyses
    snapshot.average_score = avg_score
    snapshot.total_jobs_recommended = int(total_recs)
    snapshot.total_chats = int(total_chats)
    snapshot.graph_data_json = _build_graph_data(analyses)
    snapshot.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def get_dashboard(db: Session, user_id: int) -> dict:
    snapshot = refresh_dashboard_snapshot(db, user_id)

    latest = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == user_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )

    if not latest:
        return {
            "total_resumes_analyzed": 0,
            "average_score": 0,
            "total_jobs_recommended": 0,
            "total_chats": 0,
            "latest_resume_analysis": None,
            "latest_score": None,
            "matched_skills": [],
            "missing_skills": [],
            "job_recommendations": [],
            "graph_data": [],
            "message": ZERO_STATE_MESSAGE,
        }

    rec_rows = (
        db.query(JobRecommendation, Job)
        .join(Job, Job.id == JobRecommendation.job_id)
        .filter(JobRecommendation.user_id == user_id)
        .order_by(JobRecommendation.created_at.desc())
        .limit(10)
        .all()
    )
    job_recommendations = [
        {
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "match_score": rec.match_score,
            "matched_skills": rec.matched_skills_json or [],
            "missing_skills": rec.missing_skills_json or [],
            "recommendation_reason": rec.recommendation_reason,
        }
        for rec, job in rec_rows
    ]

    return {
        "total_resumes_analyzed": snapshot.total_resumes_analyzed,
        "average_score": snapshot.average_score,
        "total_jobs_recommended": snapshot.total_jobs_recommended,
        "total_chats": snapshot.total_chats,
        "latest_resume_analysis": {
            "id": latest.id,
            "resume_filename": latest.resume_filename,
            "job_title": latest.job_title,
            "company_name": latest.company_name,
            "ats_score": latest.ats_score,
            "skill_match_score": latest.skill_match_score,
            "text_similarity_score": latest.text_similarity_score,
            "matched_skills": latest.matched_skills_json or [],
            "missing_skills": latest.missing_skills_json or [],
            "created_at": latest.created_at.isoformat() if latest.created_at else "",
        },
        "latest_score": latest.ats_score,
        "matched_skills": latest.matched_skills_json or [],
        "missing_skills": latest.missing_skills_json or [],
        "job_recommendations": job_recommendations,
        "graph_data": snapshot.graph_data_json or [],
        "message": ZERO_STATE_MESSAGE if snapshot.total_resumes_analyzed == 0 else "",
    }
