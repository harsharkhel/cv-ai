import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LoginProvider(str, enum.Enum):
    local = "local"
    google = "google"


class LoginStatus(str, enum.Enum):
    success = "success"
    failed = "failed"


class LoginLog(Base):
    __tablename__ = "login_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[LoginProvider] = mapped_column(Enum(LoginProvider, native_enum=False))
    status: Mapped[LoginStatus] = mapped_column(Enum(LoginStatus, native_enum=False))
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    device_info: Mapped[str | None] = mapped_column(String(512), nullable=True)
    login_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    user = relationship("User", back_populates="login_logs")
