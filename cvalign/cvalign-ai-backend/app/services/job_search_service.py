from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.job import Job, JobType, RemoteType
from app.models.job_search_log import JobSearchLog
from app.services.adzuna_source import search_adzuna_jobs
from app.services.google_search_source import search_jobs_via_google
from app.services.internshala_source import fetch_internshala_jobs
from app.services.jooble_source import search_jooble_jobs
from app.services.resume_analyzer import extract_skills

settings = get_settings()


def _upsert_job(db: Session, data: dict) -> Job:
    source = data.get("source", "manual")
    source_job_id = data.get("source_job_id")

    existing = None
    if source_job_id:
        existing = (
            db.query(Job)
            .filter(Job.source == source, Job.source_job_id == source_job_id)
            .first()
        )

    job_type = data.get("job_type", JobType.unknown.value)
    remote_type = data.get("remote_type", RemoteType.unknown.value)
    if isinstance(job_type, str):
        try:
            job_type = JobType(job_type)
        except ValueError:
            job_type = JobType.unknown
    if isinstance(remote_type, str):
        try:
            remote_type = RemoteType(remote_type)
        except ValueError:
            remote_type = RemoteType.unknown

    if existing:
        existing.title = data.get("title", existing.title)
        existing.description = data.get("description", existing.description)
        existing.skills_json = data.get("skills", existing.skills_json)
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing

    job = Job(
        source=source,
        source_job_id=source_job_id,
        title=data.get("title", "Untitled"),
        company=data.get("company", "Unknown"),
        location=data.get("location"),
        job_type=job_type if isinstance(job_type, JobType) else JobType.unknown,
        remote_type=remote_type if isinstance(remote_type, RemoteType) else RemoteType.unknown,
        description=data.get("description", ""),
        skills_json=data.get("skills", []),
        salary=data.get("salary"),
        stipend=data.get("stipend"),
        apply_url=data.get("apply_url"),
        source_url=data.get("source_url"),
        fetched_at=data.get("fetched_at"),
        is_active=True,
        raw_data_json=data.get("raw_data_json"),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def search_jobs(
    db: Session,
    user_id: int,
    query: str,
    location: str = "",
    job_type: Optional[str] = None,
    limit: int = 20,
) -> tuple[List[Job], str]:
    sources_used = ["database"]
    jobs: List[Job] = []

    q = db.query(Job).filter(Job.is_active == True)  # noqa: E712
    if query:
        like = f"%{query}%"
        q = q.filter(
            (Job.title.ilike(like)) | (Job.company.ilike(like)) | (Job.description.ilike(like))
        )
    if location:
        q = q.filter(Job.location.ilike(f"%{location}%"))
    if job_type and job_type != "unknown":
        try:
            q = q.filter(Job.job_type == JobType(job_type))
        except ValueError:
            pass

    db_jobs = q.order_by(Job.updated_at.desc()).limit(limit).all()
    jobs.extend(db_jobs)

    remaining = limit - len(jobs)
    if remaining > 0 and settings.JOB_LIVE_SEARCH_ENABLED:
        adzuna = search_adzuna_jobs(query, location, num=remaining)
        if adzuna:
            sources_used.append("adzuna")
        for item in adzuna:
            if len(jobs) >= limit:
                break
            job = _upsert_job(db, item)
            if job not in jobs:
                jobs.append(job)
                remaining = limit - len(jobs)

        jooble = search_jooble_jobs(query, location, num=remaining)
        if jooble:
            sources_used.append("jooble")
        for item in jooble:
            if len(jobs) >= limit:
                break
            job = _upsert_job(db, item)
            if job not in jobs:
                jobs.append(job)
                remaining = limit - len(jobs)

        external = search_jobs_via_google(query, location, num=remaining)
        if external:
            sources_used.append("google")
        for item in external:
            if len(jobs) >= limit:
                break
            job = _upsert_job(db, item)
            if job not in jobs:
                jobs.append(job)

        intern = fetch_internshala_jobs(query, location)
        if intern:
            sources_used.append("internshala")
        for item in intern[:remaining]:
            if len(jobs) >= limit:
                break
            job = _upsert_job(db, item)
            if job not in jobs:
                jobs.append(job)

    log = JobSearchLog(
        user_id=user_id,
        query=query[:500],
        location=location,
        job_type=job_type,
        source_used=",".join(sources_used),
        results_count=len(jobs),
    )
    db.add(log)
    db.commit()

    return jobs[:limit], ",".join(sources_used)


def job_to_response(job: Job):
    from app.schemas.job_schema import JobResponse

    return JobResponse(
        id=job.id,
        source=job.source,
        title=job.title,
        company=job.company,
        location=job.location,
        job_type=job.job_type.value,
        remote_type=job.remote_type.value,
        description=job.description,
        skills=job.skills_json or [],
        salary=job.salary,
        stipend=job.stipend,
        apply_url=job.apply_url,
        source_url=job.source_url,
        posted_at=job.posted_at,
        fetched_at=job.fetched_at,
    )
