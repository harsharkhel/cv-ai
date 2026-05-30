from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_filename: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    ats_score: float
    text_similarity_score: float
    skill_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    resume_skills: List[str]
    jd_skills: List[str]
    suggestions: List[str]
    improved_bullets: List[str]
    learning_roadmap: List[str]
    final_summary: str
    fit_level: Optional[str] = None
    ai_estimated_score: Optional[float] = None
    missing_keywords: List[str] = Field(default_factory=list)
    resume_strengths: List[str] = Field(default_factory=list)
    resume_weaknesses: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeHistoryItem(BaseModel):
    id: int
    resume_filename: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    ats_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeHistoryResponse(BaseModel):
    analyses: List[ResumeHistoryItem]
    total: int
