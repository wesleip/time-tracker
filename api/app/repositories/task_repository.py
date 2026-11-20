from datetime import date, datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus

TZ = ZoneInfo("America/Sao_Paulo")


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def _filtered_query(self, user_id: str, status: str | None = None, section_id: str | None = None, due_date: date | None = None, search: str | None = None, project_id: str | None = None):
        query = self.db.query(Task).filter(Task.user_id == user_id)

        if status:
            query = query.filter(Task.status == status)
        if section_id:
            query = query.filter(Task.section_id == section_id)
        if due_date:
            query = query.filter(Task.due_date == due_date)
        if search:
            query = query.filter(Task.title.ilike(f"%{search}%"))
        if project_id:
            query = query.filter(Task.project_id == project_id)

        return query

    def list_all(self, user_id: str, status: str | None = None, section_id: str | None = None, due_date: date | None = None, search: str | None = None, project_id: str | None = None, limit: int | None = None, offset: int = 0) -> list[Task]:
        query = self._filtered_query(user_id, status, section_id, due_date, search, project_id)
        query = query.order_by(Task.priority, Task.created_at.desc())

        if offset:
            query = query.offset(offset)
        if limit is not None:
            query = query.limit(limit)

        return query.all()

    def count_all(self, user_id: str, status: str | None = None, section_id: str | None = None, due_date: date | None = None, search: str | None = None, project_id: str | None = None) -> int:
        return self._filtered_query(user_id, status, section_id, due_date, search, project_id).count()

    def get_by_id(self, task_id: str, user_id: str) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    def get_by_parent(self, parent_id: str) -> list[Task]:
        return self.db.query(Task).filter(Task.parent_id == parent_id).all()

    def list_by_section(self, section_id: str) -> list[Task]:
        return self.db.query(Task).filter(Task.section_id == section_id).all()

    def clear_section(self, section_id: str) -> None:
        for task in self.list_by_section(section_id):
            task.section_id = None
        self.db.commit()

    def create(self, data: dict) -> Task:
        task = Task(**data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, data: dict) -> Task:
        for key, value in data.items():
            setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def toggle(self, task: Task) -> Task:
        if task.status == TaskStatus.PENDING.value:
            task.status = TaskStatus.COMPLETED.value
            task.completed_at = datetime.now(TZ)
        else:
            task.status = TaskStatus.PENDING.value
            task.completed_at = None
        self.db.commit()
        self.db.refresh(task)
        return task

    def complete(self, task: Task) -> Task:
        task.status = TaskStatus.COMPLETED.value
        task.completed_at = datetime.now(TZ)
        self.db.commit()
        self.db.refresh(task)
        return task
