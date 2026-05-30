from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class JobPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    description: str = Field(..., min_length=10, max_length=10000)
    job_type: str = Field(default="unknown", max_length=50)
    remote_type: str = Field(default="unknown", max_length=50)
    apply_url: Optional[str] = Field(None, max_length=512)
    skills: List[str] = Field(default_factory=list)

    @field_validator("title", "company", "location", "description", mode="before")
    @classmethod
    def strip_strings(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class CandidateSummary(BaseModel):
    analysis_id: int
    job_title: Optional[str] = None
    ats_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    created_at: str
