from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    user_uuid: str
    name: str
    email: EmailStr
    auth_provider: str
    google_sub: Optional[str] = None
    profile_picture: Optional[str] = None
    role: str
    is_email_verified: bool
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserAdminResponse(UserResponse):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}
