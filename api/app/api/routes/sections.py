from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.section_repository import SectionRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.section import SectionCreate, SectionResponse, SectionUpdate
from app.services.section_service import SectionService

router = APIRouter(prefix="/api/sections", tags=["sections"])


def get_service(db: Session = Depends(get_db)) -> SectionService:
    return SectionService(SectionRepository(db), TaskRepository(db))


@router.get("/", response_model=list[SectionResponse])
def list_sections(service: SectionService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.list_all(current_user)


@router.post("/", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(data: SectionCreate, service: SectionService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.create(data, current_user)


@router.put("/{section_id}", response_model=SectionResponse)
def update_section(section_id: str, data: SectionUpdate, service: SectionService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.update(section_id, data, current_user)


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: str, service: SectionService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.delete(section_id, current_user)
