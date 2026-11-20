from datetime import date
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.section_repository import SectionRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, TaskToggleResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def get_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(db), SectionRepository(db))


@router.get("/", response_model=list[TaskResponse])
def list_tasks(
    response: Response,
    service: TaskService = Depends(get_service),
    current_user: User = Depends(get_current_user),
    status: str | None = Query(None),
    section_id: str | None = Query(None),
    due_date: date | None = Query(None),
    search: str | None = Query(None),
    project_id: str | None = Query(None),
    limit: int | None = Query(None, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    items = service.list_all(current_user, status, section_id, due_date, search, project_id, limit, offset)
    response.headers["X-Total-Count"] = str(
        service.count_all(current_user, status, section_id, due_date, search, project_id)
    )
    return items


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.create(data, current_user)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.get_by_id(task_id, current_user)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, data: TaskUpdate, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.update(task_id, data, current_user)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.delete(task_id, current_user)


@router.patch("/{task_id}/toggle", response_model=TaskToggleResponse)
def toggle_task(task_id: str, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.toggle(task_id, current_user)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: str, service: TaskService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.complete(task_id, current_user)
