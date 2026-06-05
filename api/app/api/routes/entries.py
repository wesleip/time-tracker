from datetime import date, datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
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
):
    dt = datetime.combine(entry_date, datetime.min.time()) if entry_date else None
    return service.list_all(dt, project_id)


@router.post("/", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(data: TimeEntryCreate, service: EntryService = Depends(get_service)):
    return service.create(data)


@router.get("/{entry_id}", response_model=TimeEntryResponse)
def get_entry(entry_id: str, service: EntryService = Depends(get_service)):
    return service.get_by_id(entry_id)


@router.put("/{entry_id}", response_model=TimeEntryResponse)
def update_entry(entry_id: str, data: TimeEntryUpdate, service: EntryService = Depends(get_service)):
    return service.update(entry_id, data)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: str, service: EntryService = Depends(get_service)):
    service.delete(entry_id)
