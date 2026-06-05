from pydantic import BaseModel


class DailySummaryItem(BaseModel):
    project_id: str
    project_name: str
    project_color: str
    total_hours: float
    entries_count: int


class DailyReport(BaseModel):
    date: str
    total_hours: float
    projects: list[DailySummaryItem]


class MonthlyReportItem(BaseModel):
    date: str
    total_hours: float
    projects: list[DailySummaryItem]


class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    total_hours: float
    days: list[MonthlyReportItem]


class MonthlyReport(BaseModel):
    month: str
    total_hours: float
    days: list[MonthlyReportItem]
