from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    resume_analysis_id: Optional[int] = None
    job_id: Optional[int] = None


class ChatResponse(BaseModel):
    id: int
    ai_response: str
    context_summary: dict


class ChatHistoryItem(BaseModel):
    id: int
    user_message: str
    ai_response: str
    resume_analysis_id: Optional[int] = None
    job_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    messages: List[ChatHistoryItem]
    total: int
