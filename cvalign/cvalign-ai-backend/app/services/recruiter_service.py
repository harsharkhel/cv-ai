from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.job import Job, JobType, RemoteType
from app.models.resume_analysis import ResumeAnalysis
from app.schemas.recruiter_schema import JobPostCreate


def list_recruiter_jobs(db: Session, limit: int = 50) -> list[Job]:
    return (
        db.query(Job)
        .filter(Job.is_active == True)  # noqa: E712
        .order_by(Job.updated_at.desc())
        .limit(limit)
        .all()
    )


def list_candidate_summaries(db: Session, limit: int = 50) -> list[dict]:
    """Recruiter view: anonymized candidate fit data (no PII like email/resume text)."""
    analyses = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "analysis_id": a.id,
            "job_title": a.job_title,
            "ats_score": a.ats_score,
            "matched_skills": a.matched_skills_json or [],
            "missing_skills": a.missing_skills_json or [],
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses
    ]


def create_job_post(db: Session, data: JobPostCreate) -> Job:
    try:
        job_type = JobType(data.job_type)
    except ValueError:
        job_type = JobType.unknown
    try:
        remote_type = RemoteType(data.remote_type)
    except ValueError:
        remote_type = RemoteType.unknown

    job = Job(
        source="recruiter",
        title=data.title,
        company=data.company,
        location=data.location,
        description=data.description,
        job_type=job_type,
        remote_type=remote_type,
        skills_json=data.skills,
        apply_url=data.apply_url,
        source_url=data.apply_url,
        fetched_at=datetime.now(timezone.utc),
        is_active=True,
        raw_data_json={"posted_by": "recruiter"},
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
