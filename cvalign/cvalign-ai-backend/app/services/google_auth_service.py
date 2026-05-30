import logging
import os
from datetime import datetime, timezone

from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.login_log import LoginLog, LoginProvider, LoginStatus
from app.models.user import AuthProvider, User
from app.services.dashboard_service import create_dashboard_snapshot
from app.utils.jwt_handler import build_token_payload, create_access_token

logger = logging.getLogger(__name__)
settings = get_settings()

_firebase_admin_ready = False


def _init_firebase_admin() -> bool:
    """Initialize Firebase Admin when a service account path is configured."""
    global _firebase_admin_ready
    if _firebase_admin_ready:
        return True

    cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
    if not cred_path or not os.path.isfile(cred_path):
        return False

    try:
        import firebase_admin
        from firebase_admin import credentials

        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(
                cred,
                {"projectId": settings.FIREBASE_PROJECT_ID or None},
            )
        _firebase_admin_ready = True
        return True
    except Exception as exc:
        logger.warning("Firebase Admin init failed: %s", type(exc).__name__)
        return False


def verify_firebase_id_token(id_token_str: str) -> dict:
    """
    Verify a Firebase Auth ID token from the frontend SDK.
    Uses Firebase Admin when configured, otherwise google-auth with project audience.
    """
    project_id = settings.FIREBASE_PROJECT_ID
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase login is not configured (FIREBASE_PROJECT_ID missing)",
        )

    if _init_firebase_admin():
        try:
            from firebase_admin import auth as firebase_auth

            return firebase_auth.verify_id_token(id_token_str)
        except Exception as exc:
            logger.debug("Firebase Admin token verify failed: %s", type(exc).__name__)

    expected_iss = f"https://securetoken.google.com/{project_id}"
    audiences = [project_id]
    if settings.GOOGLE_CLIENT_ID:
        audiences.append(settings.GOOGLE_CLIENT_ID)

    last_error: Exception | None = None
    for audience in audiences:
        try:
            idinfo = google_id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                audience,
            )
            if idinfo.get("iss") == expected_iss:
                return idinfo
        except Exception as exc:
            last_error = exc
            continue

    logger.debug("Firebase token verification failed: %s", last_error)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Firebase ID token",
    )


def _log_google(
    db: Session,
    email: str,
    status_val: LoginStatus,
    user_id: int | None,
    ip_address: str,
    device_info: str,
):
    db.add(
        LoginLog(
            user_id=user_id,
            email=email,
            provider=LoginProvider.google,
            status=status_val,
            ip_address=ip_address,
            device_info=device_info,
        )
    )
    db.commit()


def google_login(
    db: Session,
    id_token_str: str,
    ip_address: str,
    device_info: str,
) -> tuple[User, str]:
    idinfo = verify_firebase_id_token(id_token_str)

    firebase_uid = idinfo.get("sub") or idinfo.get("user_id")
    email = (idinfo.get("email") or "").lower()
    name = idinfo.get("name") or (email.split("@")[0] if email else "User")
    picture = idinfo.get("picture")
    email_verified = bool(idinfo.get("email_verified", False))

    if not firebase_uid or not email:
        _log_google(db, email or "unknown", LoginStatus.failed, None, ip_address, device_info)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token missing required fields",
        )

    user = db.query(User).filter(User.google_sub == firebase_uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    now = datetime.now(timezone.utc)

    if user:
        user.google_sub = firebase_uid
        user.profile_picture = picture or user.profile_picture
        user.is_email_verified = email_verified or user.is_email_verified
        user.last_login = now
        if user.auth_provider == AuthProvider.local:
            user.auth_provider = AuthProvider.both
        elif user.auth_provider != AuthProvider.both:
            user.auth_provider = AuthProvider.google
        if not user.name and name:
            user.name = name
    else:
        user = User(
            name=name,
            email=email,
            password_hash=None,
            auth_provider=AuthProvider.google,
            google_sub=firebase_uid,
            profile_picture=picture,
            is_email_verified=email_verified,
            is_active=True,
            last_login=now,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    create_dashboard_snapshot(db, user.id)

    _log_google(db, email, LoginStatus.success, user.id, ip_address, device_info)

    token = create_access_token(
        build_token_payload(user.id, user.user_uuid, user.email, user.role.value)
    )
    return user, token
