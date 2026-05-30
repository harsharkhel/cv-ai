from typing import Any, List, Optional

from pydantic import BaseModel, Field


class DashboardGraphPoint(BaseModel):
    analysis_id: int
    label: str
    score: float
    created_at: str


class DashboardLatestAnalysis(BaseModel):
    id: int
    resume_filename: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    ats_score: float
    skill_match_score: float
    text_similarity_score: float
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    created_at: str


class DashboardJobRecommendationItem(BaseModel):
    job_id: int
    title: str
    company: str
    match_score: float
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    recommendation_reason: Optional[str] = None


class DashboardResponse(BaseModel):
    total_resumes_analyzed: int = 0
    average_score: float = 0
    total_jobs_recommended: int = 0
    total_chats: int = 0
    latest_resume_analysis: Optional[DashboardLatestAnalysis] = None
    latest_score: Optional[float] = None
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    job_recommendations: List[DashboardJobRecommendationItem] = Field(default_factory=list)
    graph_data: List[DashboardGraphPoint] = Field(default_factory=list)
    message: str = "Upload your resume and paste a job description to start analysis."
