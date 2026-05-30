from typing import List, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.job import Job
from app.models.job_recommendation import JobRecommendation
from app.models.resume_analysis import ResumeAnalysis
from app.services.dashboard_service import refresh_dashboard_snapshot
from app.services.job_search_service import _upsert_job, search_jobs
from app.services.resume_analyzer import (
    calculate_text_similarity,
    extract_skills,
)

settings = get_settings()

NO_ANALYSIS_MESSAGE = "Upload your resume and complete analysis first."


def _score_job(
    job: Job,
    resume_skills: List[str],
    jd_skills: List[str],
    resume_text: str,
    job_description: str,
) -> tuple[float, List[str], List[str], str]:
    job_skills = set(job.skills_json or extract_skills(job.description))
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    resume_overlap = len(job_skills & resume_set) / max(len(resume_set), 1) * 50
    jd_overlap = len(job_skills & jd_set) / max(len(jd_set), 1) * 30
    text_sim = calculate_text_similarity(
        resume_text + " " + job_description, job.description
    ) * 0.2

    match_score = round(resume_overlap + jd_overlap + text_sim, 2)
    matched = sorted(job_skills & (resume_set | jd_set))
    missing = sorted(job_skills - resume_set)

    reason = (
        f"Matched {len(matched)} skills relevant to your resume and target role. "
        f"ATS-style match score: {match_score}."
    )
    return min(100.0, match_score), matched, missing, reason


def get_recommendations(
    db: Session,
    user_id: int,
    resume_analysis_id: Optional[int] = None,
    role_preference: str = "",
    location: str = "",
    limit: int = 10,
) -> tuple[List[dict], str | None]:
    analysis_q = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user_id)
    if resume_analysis_id:
        analysis = analysis_q.filter(ResumeAnalysis.id == resume_analysis_id).first()
    else:
        analysis = analysis_q.order_by(ResumeAnalysis.created_at.desc()).first()

    if not analysis:
        return [], NO_ANALYSIS_MESSAGE

    resume_skills = analysis.resume_skills_json or []
    jd_skills = analysis.jd_skills_json or []
    query = role_preference or analysis.job_title or " ".join(jd_skills[:3]) or "internship"

    jobs, _ = search_jobs(db, user_id, query, location, limit=30)

    recommendations = []
    for job in jobs:
        score, matched, missing, reason = _score_job(
            job,
            resume_skills,
            jd_skills,
            analysis.resume_text,
            analysis.job_description,
        )
        if score < settings.MIN_RECOMMENDATION_SCORE:
            continue

        rec = JobRecommendation(
            user_id=user_id,
            resume_analysis_id=analysis.id,
            job_id=job.id,
            match_score=score,
            matched_skills_json=matched,
            missing_skills_json=missing,
            recommendation_reason=reason,
        )
        db.add(rec)
        recommendations.append(
            {
                "job_id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "source": job.source,
                "match_score": score,
                "matched_skills": matched,
                "missing_skills": missing,
                "recommendation_reason": reason,
                "apply_url": job.apply_url,
            }
        )
        if len(recommendations) >= limit:
            break

    db.commit()
    refresh_dashboard_snapshot(db, user_id)
    return recommendations, None


def match_single_job(
    db: Session,
    user_id: int,
    job_id: int,
    resume_analysis_id: Optional[int] = None,
) -> dict:
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()  # noqa: E712
    if not job:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    analysis_q = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user_id)
    if resume_analysis_id:
        analysis = analysis_q.filter(ResumeAnalysis.id == resume_analysis_id).first()
    else:
        analysis = analysis_q.order_by(ResumeAnalysis.created_at.desc()).first()

    if not analysis:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume analysis found. Analyze a resume first.",
        )

    score, matched, missing, reason = _score_job(
        job,
        analysis.resume_skills_json or [],
        analysis.jd_skills_json or [],
        analysis.resume_text,
        analysis.job_description,
    )

    rec = JobRecommendation(
        user_id=user_id,
        resume_analysis_id=analysis.id,
        job_id=job.id,
        match_score=score,
        matched_skills_json=matched,
        missing_skills_json=missing,
        recommendation_reason=reason,
    )
    db.add(rec)
    db.commit()

    return {
        "job_id": job.id,
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation_reason": reason,
    }
