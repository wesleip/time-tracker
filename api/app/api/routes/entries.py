from datetime import date, datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.entry_repository import EntryRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.time_entry import TimeEntryCreate, TimeEntryResponse, TimeEntryUpdate, TimeEntryWithProject
from app.services.entry_service import EntryService

router = APIRouter(prefix="/api/entries", tags=["entries"])


def get_service(db: Session = Depends(get_db)) -> EntryService:
    return EntryService(EntryRepository(db), ProjectRepository(db))


@router.get("/", response_model=list[TimeEntryWithProject])
def list_entries(
    entry_date: date | None = Query(None, alias="date"),
    project_id: str | None = Query(None),
    service: EntryService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    dt = datetime.combine(entry_date, datetime.min.time()) if entry_date else None
    return service.list_all(current_user, dt, project_id)


@router.post("/", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(data: TimeEntryCreate, service: EntryService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.create(data, current_user)


@router.get("/{entry_id}", response_model=TimeEntryResponse)
def get_entry(entry_id: str, service: EntryService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.get_by_id(entry_id, current_user)


@router.put("/{entry_id}", response_model=TimeEntryResponse)
def update_entry(entry_id: str, data: TimeEntryUpdate, service: EntryService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.update(entry_id, data, current_user)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: str, service: EntryService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.delete(entry_id, current_user)
