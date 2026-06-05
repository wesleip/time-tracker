from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.time_entry import TimeEntry


class EntryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self, entry_date: datetime | None = None, project_id: str | None = None) -> list[TimeEntry]:
        query = self.db.query(TimeEntry)
        if entry_date:
            start = entry_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = entry_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            query = query.filter(TimeEntry.date >= start, TimeEntry.date <= end)
        if project_id:
            query = query.filter(TimeEntry.project_id == project_id)
        return query.order_by(TimeEntry.date.desc()).all()

    def get_by_id(self, entry_id: str) -> TimeEntry | None:
        return self.db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()

    def create(self, data: dict) -> TimeEntry:
        entry = TimeEntry(**data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update(self, entry: TimeEntry, data: dict) -> TimeEntry:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry: TimeEntry) -> None:
        self.db.delete(entry)
        self.db.commit()

    def daily_summary(self, start: datetime, end: datetime) -> list[dict]:
        rows = (
            self.db.query(
                TimeEntry.project_id,
                Project.name.label("project_name"),
                Project.color.label("project_color"),
                func.sum(TimeEntry.hours).label("total_hours"),
                func.count(TimeEntry.id).label("entries_count"),
            )
            .join(Project)
            .filter(TimeEntry.date >= start, TimeEntry.date <= end)
            .group_by(TimeEntry.project_id, Project.name, Project.color)
            .all()
        )
        return [dict(r._mapping) for r in rows]

    def monthly_summary(self, start: datetime, end: datetime) -> list[dict]:
        rows = (
            self.db.query(
                func.date(TimeEntry.date).label("day"),
                TimeEntry.project_id,
                Project.name.label("project_name"),
                Project.color.label("project_color"),
                func.sum(TimeEntry.hours).label("total_hours"),
                func.count(TimeEntry.id).label("entries_count"),
            )
            .join(Project)
            .filter(TimeEntry.date >= start, TimeEntry.date <= end)
            .group_by(func.date(TimeEntry.date), TimeEntry.project_id, Project.name, Project.color)
            .order_by(func.date(TimeEntry.date))
            .all()
        )
        return [dict(r._mapping) for r in rows]
