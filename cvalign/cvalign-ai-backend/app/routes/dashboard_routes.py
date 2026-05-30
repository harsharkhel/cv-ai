from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.dashboard_schema import DashboardResponse
from app.services.dashboard_service import get_dashboard
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return DashboardResponse(**get_dashboard(db, current_user.id))
