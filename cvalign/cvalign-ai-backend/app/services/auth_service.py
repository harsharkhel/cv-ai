import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.login_log import LoginLog, LoginProvider, LoginStatus
from app.models.user import AuthProvider, User, UserRole
from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.services.dashboard_service import create_dashboard_snapshot
from app.utils.jwt_handler import build_token_payload, create_access_token
from app.utils.security import hash_password, verify_password


def _log_login(
    db: Session,
    email: str,
    provider: LoginProvider,
    status_val: LoginStatus,
    user_id: int | None,
    ip_address: str,
    device_info: str,
):
    db.add(
        LoginLog(
            user_id=user_id,
            email=email,
            provider=provider,
            status=status_val,
            ip_address=ip_address,
            device_info=device_info,
        )
    )
    db.commit()


def register_user(
    db: Session,
    data: RegisterRequest,
    ip_address: str,
    device_info: str,
) -> tuple[User, str]:
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        _log_login(
            db, data.email, LoginProvider.local, LoginStatus.failed, None, ip_address, device_info
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    now = datetime.now(timezone.utc)
    user = User(
        user_uuid=str(uuid.uuid4()),
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        auth_provider=AuthProvider.local,
        role=UserRole.user,
        is_email_verified=False,
        is_active=True,
        last_login=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_dashboard_snapshot(db, user.id)

    _log_login(
        db, user.email, LoginProvider.local, LoginStatus.success, user.id, ip_address, device_info
    )

    token = create_access_token(
        build_token_payload(user.id, user.user_uuid, user.email, user.role.value)
    )
    return user, token


def login_user(
    db: Session,
    data: LoginRequest,
    ip_address: str,
    device_info: str,
) -> tuple[User, str]:
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not user.password_hash:
        _log_login(
            db, data.email, LoginProvider.local, LoginStatus.failed, None, ip_address, device_info
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password_hash):
        _log_login(
            db, data.email, LoginProvider.local, LoginStatus.failed, user.id, ip_address, device_info
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    now = datetime.now(timezone.utc)
    user.last_login = now
    db.commit()
    db.refresh(user)

    create_dashboard_snapshot(db, user.id)

    _log_login(
        db, user.email, LoginProvider.local, LoginStatus.success, user.id, ip_address, device_info
    )

    token = create_access_token(
        build_token_payload(user.id, user.user_uuid, user.email, user.role.value)
    )
    return user, token


def seed_admin_if_configured(db: Session, admin_email: str, admin_password: str):
    if not admin_email or not admin_password:
        return
    existing = db.query(User).filter(User.email == admin_email.lower()).first()
    if existing:
        if existing.role != UserRole.admin:
            existing.role = UserRole.admin
            db.commit()
        return
    user = User(
        user_uuid=str(uuid.uuid4()),
        name="Admin",
        email=admin_email.lower(),
        password_hash=hash_password(admin_password),
        auth_provider=AuthProvider.local,
        role=UserRole.admin,
        is_email_verified=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    create_dashboard_snapshot(db, user.id)
