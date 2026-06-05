from datetime import datetime, timedelta

from app.repositories.entry_repository import EntryRepository
from app.schemas.report import DailyReport, DailySummaryItem, MonthlyReport, MonthlyReportItem


class ReportService:
    def __init__(self, entry_repo: EntryRepository):
        self.entry_repo = entry_repo

    def daily(self, report_date: datetime) -> DailyReport:
        start = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = report_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        rows = self.entry_repo.daily_summary(start, end)
        total = sum(r["total_hours"] or 0 for r in rows)

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

        return DailyReport(date=report_date.date().isoformat(), total_hours=round(total, 2), projects=projects)

    def monthly(self, month: str) -> MonthlyReport:
        parts = month.split("-")
        year, month_num = int(parts[0]), int(parts[1])

        start = datetime(year, month_num, 1)
        if month_num == 12:
            end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
        else:
            end = datetime(year, month_num + 1, 1) - timedelta(seconds=1)

        day_rows = self.entry_repo.monthly_summary(start, end)

        days_map: dict[str, list[DailySummaryItem]] = {}
        day_totals: dict[str, float] = {}

        for r in day_rows:
            d = str(r["day"])
            if d not in days_map:
                days_map[d] = []
                day_totals[d] = 0
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

        grand_total = sum(day_totals.values())
        days_list = [
            MonthlyReportItem(date=d, total_hours=round(day_totals[d], 2), projects=days_map[d])
            for d in sorted(days_map.keys())
        ]

        return MonthlyReport(month=month, total_hours=round(grand_total, 2), days=days_list)
