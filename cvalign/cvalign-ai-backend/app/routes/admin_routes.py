from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_chat_message import AIChatMessage
from app.models.job import Job
from app.models.job_recommendation import JobRecommendation
from app.models.job_search_log import JobSearchLog
from app.models.login_log import LoginLog
from app.models.resume_analysis import ResumeAnalysis
from app.models.user import User
from app.schemas.user_schema import UserAdminResponse
from app.services import export_service
from app.utils.dependencies import require_admin, user_to_response

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users = db.query(User).all()
    return {
        "users": [
            {
                **user_to_response(u).model_dump(),
                "id": u.id,
                "updated_at": u.updated_at,
            }
            for u in users
        ],
        "total": len(users),
    }


@router.get("/login-logs")
def list_login_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    logs = db.query(LoginLog).order_by(LoginLog.login_time.desc()).limit(500).all()
    return {
        "logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "email": l.email,
                "provider": l.provider.value,
                "status": l.status.value,
                "ip_address": l.ip_address,
                "device_info": l.device_info,
                "login_time": l.login_time,
            }
            for l in logs
        ],
        "total": len(logs),
    }


@router.get("/resume-analyses")
def list_resume_analyses(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    items = db.query(ResumeAnalysis).order_by(ResumeAnalysis.created_at.desc()).limit(500).all()
    return {
        "analyses": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "resume_filename": a.resume_filename,
                "job_title": a.job_title,
                "ats_score": a.ats_score,
                "created_at": a.created_at,
            }
            for a in items
        ],
        "total": len(items),
    }


@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    jobs = db.query(Job).limit(500).all()
    return {
        "jobs": [
            {
                "id": j.id,
                "source": j.source,
                "title": j.title,
                "company": j.company,
                "is_active": j.is_active,
            }
            for j in jobs
        ],
        "total": len(jobs),
    }


@router.get("/job-search-logs")
def list_job_search_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    logs = db.query(JobSearchLog).order_by(JobSearchLog.searched_at.desc()).limit(500).all()
    return {"logs": [{"id": l.id, "user_id": l.user_id, "query": l.query} for l in logs], "total": len(logs)}


@router.get("/job-recommendations")
def list_job_recommendations(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    recs = db.query(JobRecommendation).limit(500).all()
    return {
        "recommendations": [
            {"id": r.id, "user_id": r.user_id, "job_id": r.job_id, "match_score": r.match_score}
            for r in recs
        ],
        "total": len(recs),
    }


@router.get("/chat-messages")
def list_chat_messages(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    messages = db.query(AIChatMessage).order_by(AIChatMessage.created_at.desc()).limit(500).all()
    return {
        "messages": [
            {"id": m.id, "user_id": m.user_id, "user_message": m.user_message[:200]}
            for m in messages
        ],
        "total": len(messages),
    }


def _excel_response(buffer, filename: str):
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/users")
def export_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_users(db), "users.xlsx")


@router.get("/export/login-logs")
def export_login_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_login_logs(db), "login_logs.xlsx")


@router.get("/export/resume-analyses")
def export_resume_analyses(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_resume_analyses(db), "resume_analyses.xlsx")


@router.get("/export/jobs")
def export_jobs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_jobs(db), "jobs.xlsx")


@router.get("/export/job-search-logs")
def export_job_search_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_job_search_logs(db), "job_search_logs.xlsx")


@router.get("/export/job-recommendations")
def export_job_recommendations(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_job_recommendations(db), "job_recommendations.xlsx")


@router.get("/export/chat-messages")
def export_chat_messages(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _excel_response(export_service.export_chat_messages(db), "ai_chat_messages.xlsx")
