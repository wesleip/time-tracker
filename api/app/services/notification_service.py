from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationUpdate


class NotificationService:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo

    def list_all(self, user: User, unread_only: bool = False):
        return self.repo.list_all(user.id, unread_only)

    def get_by_id(self, notification_id: str, user: User):
        notification = self.repo.get_by_id(notification_id, user.id)
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        return notification

    def create(self, data: NotificationCreate, user: User):
        payload = data.model_dump()
        payload["user_id"] = user.id
        return self.repo.create(payload)

    def mark_as_read(self, notification_id: str, user: User):
        notification = self.repo.get_by_id(notification_id, user.id)
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        return self.repo.mark_as_read(notification)

    def mark_all_as_read(self, user: User):
        self.repo.mark_all_as_read(user.id)

    def delete(self, notification_id: str, user: User):
        notification = self.repo.get_by_id(notification_id, user.id)
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        self.repo.delete(notification)

    def get_unread_count(self, user: User):
        return self.repo.get_unread_count(user.id)
