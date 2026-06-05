from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/api/projects", tags=["projects"])


def get_service(db: Session = Depends(get_db)) -> ProjectService:
    return ProjectService(ProjectRepository(db))


@router.get("/", response_model=list[ProjectResponse])
def list_projects(service: ProjectService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.list_all(current_user)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, service: ProjectService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.create(data, current_user)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, service: ProjectService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.get_by_id(project_id, current_user)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, service: ProjectService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.update(project_id, data, current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, service: ProjectService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.delete(project_id, current_user)
