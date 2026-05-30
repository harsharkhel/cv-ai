from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.recruiter_schema import JobPostCreate
from app.services.job_search_service import job_to_response
from app.services.recruiter_service import create_job_post, list_candidate_summaries, list_recruiter_jobs
from app.utils.dependencies import require_recruiter

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])


@router.get("/jobs")
def recruiter_jobs(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    recruiter: User = Depends(require_recruiter),
):
    jobs = list_recruiter_jobs(db, limit)
    return {"jobs": [job_to_response(j) for j in jobs], "total": len(jobs)}


@router.get("/candidates")
def recruiter_candidates(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    recruiter: User = Depends(require_recruiter),
):
    candidates = list_candidate_summaries(db, limit)
    return {"candidates": candidates, "total": len(candidates)}


@router.post("/job-posts", status_code=201)
def post_job(
    data: JobPostCreate,
    db: Session = Depends(get_db),
    recruiter: User = Depends(require_recruiter),
):
    job = create_job_post(db, data)
    return job_to_response(job)
