from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class JobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    resume_analysis_id: Mapped[int | None] = mapped_column(
        ForeignKey("resume_analyses.id"), nullable=True, index=True
    )
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False, index=True)
    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    matched_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    recommendation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="job_recommendations")
    resume_analysis = relationship("ResumeAnalysis", back_populates="recommendations")
    job = relationship("Job", back_populates="recommendations")
