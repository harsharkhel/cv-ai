from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    resume_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    resume_text: Mapped[str] = mapped_column(Text, nullable=False)
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    ats_score: Mapped[float] = mapped_column(Float, nullable=False)
    text_similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    skill_match_score: Mapped[float] = mapped_column(Float, nullable=False)
    matched_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    resume_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    jd_skills_json: Mapped[list] = mapped_column(JSON, default=list)
    suggestions_json: Mapped[dict] = mapped_column(JSON, default=dict)
    improved_bullets_json: Mapped[list] = mapped_column(JSON, default=list)
    learning_roadmap_json: Mapped[list] = mapped_column(JSON, default=list)
    final_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="resume_analyses")
    recommendations = relationship("JobRecommendation", back_populates="resume_analysis")
