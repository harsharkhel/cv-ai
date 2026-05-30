import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class AuthProvider(str, enum.Enum):
    local = "local"
    google = "google"
    both = "both"


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    recruiter = "recruiter"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_uuid: Mapped[str] = mapped_column(
        String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider, native_enum=False), default=AuthProvider.local, nullable=False
    )
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False), default=UserRole.user, nullable=False
    )
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    login_logs = relationship("LoginLog", back_populates="user")
    resume_analyses = relationship("ResumeAnalysis", back_populates="user")
    job_search_logs = relationship("JobSearchLog", back_populates="user")
    job_recommendations = relationship("JobRecommendation", back_populates="user")
    chat_messages = relationship("AIChatMessage", back_populates="user")
    dashboard_snapshot = relationship(
        "DashboardSnapshot", back_populates="user", uselist=False
    )
