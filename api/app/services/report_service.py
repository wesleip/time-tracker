from datetime import datetime, timedelta

from app.models.user import User
from app.repositories.entry_repository import EntryRepository
from app.schemas.report import DailyReport, DailySummaryItem, MonthlyReport, MonthlyReportItem, WeeklyReport


def _build_days(rows: list[dict]) -> tuple[list[MonthlyReportItem], float]:
    days_map: dict[str, list[DailySummaryItem]] = {}
    day_totals: dict[str, float] = {}

    for r in rows:
        d = str(r["day"])
        if d not in days_map:
            days_map[d] = []
            day_totals[d] = 0.0
        days_map[d].append(
            DailySummaryItem(
                project_id=r["project_id"],
                project_name=r["project_name"],
                project_color=r["project_color"],
                total_hours=float(r["total_hours"] or 0),
                entries_count=r["entries_count"],
            )
        )
        day_totals[d] += float(r["total_hours"] or 0)

    days_list = [
        MonthlyReportItem(date=d, total_hours=round(day_totals[d], 2), projects=days_map[d])
        for d in sorted(days_map.keys())
    ]
    return days_list, round(sum(day_totals.values()), 2)


class ReportService:
    def __init__(self, entry_repo: EntryRepository):
        self.entry_repo = entry_repo

    def daily(self, report_date: datetime, user: User) -> DailyReport:
        start = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = report_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        rows = self.entry_repo.daily_summary(user.id, start, end)
        total = round(sum(r["total_hours"] or 0 for r in rows), 2)
        projects = [
            DailySummaryItem(
                project_id=r["project_id"],
                project_name=r["project_name"],
                project_color=r["project_color"],
                total_hours=float(r["total_hours"] or 0),
                entries_count=r["entries_count"],
            )
            for r in rows
        ]
        return DailyReport(date=report_date.date().isoformat(), total_hours=total, projects=projects)

    def weekly(self, week_date: datetime, user: User) -> WeeklyReport:
        monday = week_date - timedelta(days=week_date.weekday())
        start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = (monday + timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=999999)

        rows = self.entry_repo.period_summary(user.id, start, end)
        days_list, grand_total = _build_days(rows)

        return WeeklyReport(
            week_start=start.date().isoformat(),
            week_end=end.date().isoformat(),
            total_hours=grand_total,
            days=days_list,
        )

    def monthly(self, month: str, user: User) -> MonthlyReport:
        year, month_num = int(month[:4]), int(month[5:7])
        start = datetime(year, month_num, 1)
        end = (datetime(year + 1, 1, 1) if month_num == 12 else datetime(year, month_num + 1, 1)) - timedelta(seconds=1)

        rows = self.entry_repo.period_summary(user.id, start, end)
        days_list, grand_total = _build_days(rows)

        return MonthlyReport(month=month, total_hours=grand_total, days=days_list)
