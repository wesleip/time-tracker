from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def get_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))


@router.get("/", response_model=list[NotificationResponse])
def list_notifications(
    service: NotificationService = Depends(get_service),
    current_user: User = Depends(get_current_user),
    unread_only: bool = Query(False),
):
    return service.list_all(current_user, unread_only)


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(data: NotificationCreate, service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.create(data, current_user)


@router.get("/unread-count")
def get_unread_count(service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return {"count": service.get_unread_count(current_user)}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: str, service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    return service.mark_as_read(notification_id, current_user)


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_as_read(service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.mark_all_as_read(current_user)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, service: NotificationService = Depends(get_service), current_user: User = Depends(get_current_user)):
    service.delete(notification_id, current_user)
