from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.entry_repository import EntryRepository
from app.schemas.report import DailyReport, MonthlyReport, WeeklyReport
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_service(db: Session = Depends(get_db)) -> ReportService:
    return ReportService(EntryRepository(db))


@router.get("/daily", response_model=DailyReport)
def daily_report(
    report_date: date = Query(...),
    service: ReportService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.daily(datetime.combine(report_date, datetime.min.time()), current_user)


@router.get("/weekly", response_model=WeeklyReport)
def weekly_report(
    report_date: date = Query(...),
    service: ReportService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.weekly(datetime.combine(report_date, datetime.min.time()), current_user)


@router.get("/monthly", response_model=MonthlyReport)
def monthly_report(
    month: str = Query(...),
    service: ReportService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.monthly(month, current_user)
