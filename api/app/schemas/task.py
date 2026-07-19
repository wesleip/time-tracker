from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    priority: int = 3


class TaskCreate(TaskBase):
    section_id: str | None = None
    project_id: str | None = None
    due_date: date | None = None
    recurrence: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    section_id: str | None = None
    project_id: str | None = None
    priority: int | None = None
    due_date: date | None = None
    recurrence: str | None = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    section_id: str | None
    project_id: str | None
    parent_id: str | None
    status: str
    due_date: date | None
    recurrence: str | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskToggleResponse(BaseModel):
    id: str
    status: str
    completed_at: datetime | None
