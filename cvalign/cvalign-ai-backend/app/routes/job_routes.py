from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job_schema import (
    JobMatchResponse,
    JobRecommendationItem,
    JobRecommendationsResponse,
    JobResponse,
    JobSearchResponse,
)
from app.services.job_recommendation_service import get_recommendations, match_single_job
from app.services.job_search_service import job_to_response, search_jobs
from app.utils.dependencies import get_current_user
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/search", response_model=JobSearchResponse)
@limiter.limit("30/minute")
def search(
    request: Request,
    query: str = Query("", max_length=200),
    location: str = Query("", max_length=100),
    job_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jobs, _ = search_jobs(db, current_user.id, query, location, job_type, limit)
    return JobSearchResponse(
        jobs=[job_to_response(j) for j in jobs],
        total=len(jobs),
    )


@router.get("/recommendations", response_model=JobRecommendationsResponse)
def recommendations(
    resume_analysis_id: Optional[int] = Query(None),
    role_preference: str = Query("", max_length=200),
    location: str = Query("", max_length=100),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recs, message = get_recommendations(
        db,
        current_user.id,
        resume_analysis_id=resume_analysis_id,
        role_preference=role_preference,
        location=location,
        limit=limit,
    )
    return JobRecommendationsResponse(
        recommendations=[JobRecommendationItem(**r) for r in recs],
        message=message or "",
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()  # noqa: E712
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job_to_response(job)


@router.post("/match/{job_id}", response_model=JobMatchResponse)
def match_job(
    job_id: int,
    resume_analysis_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = match_single_job(db, current_user.id, job_id, resume_analysis_id)
    return JobMatchResponse(**result)
