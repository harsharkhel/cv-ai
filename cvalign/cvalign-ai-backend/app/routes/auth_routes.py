from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import (
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
)
from app.schemas.user_schema import UserResponse
from app.services.auth_service import login_user, register_user
from app.services.google_auth_service import google_login
from app.utils.dependencies import (
    get_client_ip,
    get_current_user,
    get_device_info,
    user_to_response,
)
from app.utils.rate_limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse)
@limiter.limit("3/minute")
def register(
    request: Request,
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    user, token = register_user(db, data, get_client_ip(request), get_device_info(request))
    return AuthResponse(access_token=token, user=user_to_response(user))


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user, token = login_user(db, data, get_client_ip(request), get_device_info(request))
    return AuthResponse(access_token=token, user=user_to_response(user))


@router.post("/google", response_model=AuthResponse)
@limiter.limit("5/minute")
def google_auth(
    request: Request,
    data: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    user, token = google_login(
        db, data.id_token, get_client_ip(request), get_device_info(request)
    )
    return AuthResponse(access_token=token, user=user_to_response(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(message="Logged out successfully. Discard your token on the client.")
