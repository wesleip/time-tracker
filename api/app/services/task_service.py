from datetime import date, timedelta
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status

from app.models.user import User
from app.models.task import Task, TaskStatus, Recurrence
from app.repositories.task_repository import TaskRepository
from app.repositories.section_repository import SectionRepository
from app.schemas.task import TaskCreate, TaskUpdate

TZ = ZoneInfo("America/Sao_Paulo")


class TaskService:
    def __init__(self, repo: TaskRepository, section_repo: SectionRepository):
        self.repo = repo
        self.section_repo = section_repo

    def list_all(self, user: User, status: str | None = None, section_id: str | None = None, due_date: date | None = None, search: str | None = None, project_id: str | None = None):
        self.section_repo.ensure_default(user.id)
        return self.repo.list_all(user.id, status, section_id, due_date, search, project_id)

    def get_by_id(self, task_id: str, user: User):
        task = self.repo.get_by_id(task_id, user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task

    def create(self, data: TaskCreate, user: User):
        self.section_repo.ensure_default(user.id)
        payload = data.model_dump()
        payload["user_id"] = user.id
        if not payload.get("section_id"):
            default = self.section_repo.get_default(user.id)
            if default:
                payload["section_id"] = default.id
        return self.repo.create(payload)

    def update(self, task_id: str, data: TaskUpdate, user: User):
        task = self.repo.get_by_id(task_id, user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return self.repo.update(task, data.model_dump(exclude_unset=True))

    def delete(self, task_id: str, user: User):
        task = self.repo.get_by_id(task_id, user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        self.repo.delete(task)

    def toggle(self, task_id: str, user: User):
        task = self.repo.get_by_id(task_id, user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return self.repo.toggle(task)

    def complete(self, task_id: str, user: User):
        task = self.repo.get_by_id(task_id, user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        self.repo.complete(task)

        if task.recurrence:
            next_due = self._calculate_next_due(task.due_date, task.recurrence)
            if next_due:
                self.repo.create({
                    "user_id": task.user_id,
                    "section_id": task.section_id,
                    "project_id": task.project_id,
                    "parent_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "due_date": next_due,
                    "recurrence": task.recurrence,
                })

        return task

    def _calculate_next_due(self, current_due: date | None, recurrence: str) -> date | None:
        if not current_due:
            today = date.today()
        else:
            today = current_due

        if recurrence == Recurrence.DAILY.value:
            return today + timedelta(days=1)
        elif recurrence == Recurrence.WEEKLY.value:
            return today + timedelta(weeks=1)
        elif recurrence == Recurrence.MONTHLY.value:
            month = today.month + 1
            year = today.year
            if month > 12:
                month = 1
                year += 1
            day = min(today.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
            return date(year, month, day)
        return None
