from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self, user_id: str, unread_only: bool = False) -> list[Notification]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).all()

    def get_by_id(self, notification_id: str, user_id: str) -> Notification | None:
        return self.db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()

    def create(self, data: dict) -> Notification:
        notification = Notification(**data)
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_as_read(self, notification: Notification) -> Notification:
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: str) -> None:
        self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        self.db.commit()

    def delete(self, notification: Notification) -> None:
        self.db.delete(notification)
        self.db.commit()

    def get_unread_count(self, user_id: str) -> int:
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()
