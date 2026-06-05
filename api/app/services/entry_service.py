from datetime import datetime

from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.entry_repository import EntryRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.time_entry import TimeEntryCreate, TimeEntryUpdate, TimeEntryWithProject


class EntryService:
    def __init__(self, entry_repo: EntryRepository, project_repo: ProjectRepository):
        self.entry_repo = entry_repo
        self.project_repo = project_repo

    def list_all(self, user: User, entry_date: datetime | None = None, project_id: str | None = None):
        entries = self.entry_repo.list_all(user.id, entry_date, project_id)
        return [
            TimeEntryWithProject(
                id=e.id,
                project_id=e.project_id,
                description=e.description,
                hours=e.hours,
                date=e.date,
                created_at=e.created_at,
                updated_at=e.updated_at,
                project_name=e.project.name,
                project_color=e.project.color,
            )
            for e in entries
        ]

    def get_by_id(self, entry_id: str, user: User):
        entry = self.entry_repo.get_by_id(entry_id, user.id)
        if not entry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
        return entry

    def create(self, data: TimeEntryCreate, user: User):
        project = self.project_repo.get_by_id(data.project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return self.entry_repo.create(data.model_dump())

    def update(self, entry_id: str, data: TimeEntryUpdate, user: User):
        entry = self.entry_repo.get_by_id(entry_id, user.id)
        if not entry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
        return self.entry_repo.update(entry, data.model_dump(exclude_unset=True))

    def delete(self, entry_id: str, user: User):
        entry = self.entry_repo.get_by_id(entry_id, user.id)
        if not entry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
        self.entry_repo.delete(entry)
