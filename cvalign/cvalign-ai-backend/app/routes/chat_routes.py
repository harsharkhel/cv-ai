from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ai_chat_message import AIChatMessage
from app.models.user import User
from app.schemas.chat_schema import ChatHistoryItem, ChatHistoryResponse, ChatRequest, ChatResponse
from app.services.chatbot_service import chat
from app.utils.dependencies import get_current_user
from app.utils.rate_limiter import get_user_id_key, limiter

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute", key_func=get_user_id_key)
def send_message(
    request: Request,
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record, context = chat(
        db,
        current_user.id,
        data.message,
        data.resume_analysis_id,
        data.job_id,
    )
    return ChatResponse(
        id=record.id,
        ai_response=record.ai_response,
        context_summary=context,
    )


@router.get("/history", response_model=ChatHistoryResponse)
def chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    messages = (
        db.query(AIChatMessage)
        .filter(AIChatMessage.user_id == current_user.id)
        .order_by(AIChatMessage.created_at.desc())
        .all()
    )
    return ChatHistoryResponse(
        messages=[
            ChatHistoryItem(
                id=m.id,
                user_message=m.user_message,
                ai_response=m.ai_response,
                resume_analysis_id=m.resume_analysis_id,
                job_id=m.job_id,
                created_at=m.created_at,
            )
            for m in messages
        ],
        total=len(messages),
    )


@router.delete("/history")
def delete_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(AIChatMessage).filter(AIChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history deleted"}
