from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resume_analysis import ResumeAnalysis
from app.models.user import User
from app.schemas.resume_schema import ResumeAnalysisResponse, ResumeHistoryItem, ResumeHistoryResponse
from app.services.ai_analysis_service import merge_analysis, run_ai_resume_analysis
from app.services.dashboard_service import refresh_dashboard_snapshot
from app.services.resume_analyzer import analyze_resume_local
from app.services.resume_parser import save_and_parse_resume
from app.utils.dependencies import get_current_user
from app.utils.rate_limiter import get_user_id_key, limiter

router = APIRouter(prefix="/resume", tags=["Resume"])


def _analysis_to_response(analysis: ResumeAnalysis) -> ResumeAnalysisResponse:
    suggestions_data = analysis.suggestions_json or {}
    return ResumeAnalysisResponse(
        id=analysis.id,
        resume_filename=analysis.resume_filename,
        job_title=analysis.job_title,
        company_name=analysis.company_name,
        ats_score=analysis.ats_score,
        text_similarity_score=analysis.text_similarity_score,
        skill_match_score=analysis.skill_match_score,
        matched_skills=analysis.matched_skills_json or [],
        missing_skills=analysis.missing_skills_json or [],
        resume_skills=analysis.resume_skills_json or [],
        jd_skills=analysis.jd_skills_json or [],
        suggestions=suggestions_data.get("suggestions", []),
        improved_bullets=analysis.improved_bullets_json or [],
        learning_roadmap=(
            analysis.learning_roadmap_json
            or suggestions_data.get("learning_roadmap", [])
            or []
        ),
        final_summary=analysis.final_summary or suggestions_data.get("final_summary", "") or "",
        fit_level=suggestions_data.get("fit_level"),
        ai_estimated_score=suggestions_data.get("ai_estimated_score"),
        missing_keywords=suggestions_data.get("missing_keywords", []),
        resume_strengths=suggestions_data.get("resume_strengths", []),
        resume_weaknesses=suggestions_data.get("resume_weaknesses", []),
        created_at=analysis.created_at,
    )


@router.post("/analyze", response_model=ResumeAnalysisResponse)
@limiter.limit("10/minute", key_func=get_user_id_key)
async def analyze_resume(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(...),
    job_title: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty",
        )

    filename, resume_text = await save_and_parse_resume(file, current_user.user_uuid)
    local = analyze_resume_local(resume_text, job_description.strip())
    ai = run_ai_resume_analysis(resume_text, job_description.strip(), local)
    merged = merge_analysis(local, ai)

    analysis = ResumeAnalysis(
        user_id=current_user.id,
        resume_filename=filename,
        resume_text=resume_text,
        job_title=job_title,
        company_name=company_name,
        job_description=job_description.strip(),
        ats_score=merged["ats_score"],
        text_similarity_score=merged["text_similarity_score"],
        skill_match_score=merged["skill_match_score"],
        matched_skills_json=merged["matched_skills"],
        missing_skills_json=merged["missing_skills"],
        resume_skills_json=merged["resume_skills"],
        jd_skills_json=merged["jd_skills"],
        suggestions_json={
            "suggestions": merged["suggestions"],
            "learning_roadmap": merged["learning_roadmap"],
            "final_summary": merged["final_summary"],
            "fit_level": merged.get("fit_level"),
            "ai_estimated_score": merged.get("ai_estimated_score"),
            "missing_keywords": merged.get("missing_keywords", []),
            "resume_strengths": merged.get("resume_strengths", []),
            "resume_weaknesses": merged.get("resume_weaknesses", []),
        },
        improved_bullets_json=merged["improved_bullets"],
        learning_roadmap_json=merged["learning_roadmap"],
        final_summary=merged["final_summary"] or None,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    refresh_dashboard_snapshot(db, current_user.id)
    return _analysis_to_response(analysis)


@router.get("/history", response_model=ResumeHistoryResponse)
def resume_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )
    return ResumeHistoryResponse(
        analyses=[
            ResumeHistoryItem(
                id=a.id,
                resume_filename=a.resume_filename,
                job_title=a.job_title,
                company_name=a.company_name,
                ats_score=a.ats_score,
                created_at=a.created_at,
            )
            for a in items
        ],
        total=len(items),
    )


@router.get("/analysis/{analysis_id}", response_model=ResumeAnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.id == analysis_id,
            ResumeAnalysis.user_id == current_user.id,
        )
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return _analysis_to_response(analysis)


@router.delete("/analysis/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.id == analysis_id,
            ResumeAnalysis.user_id == current_user.id,
        )
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
    refresh_dashboard_snapshot(db, current_user.id)
    return {"message": "Analysis deleted"}
