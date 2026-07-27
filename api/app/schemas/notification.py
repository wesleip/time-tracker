from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    title: str
    message: str | None = None
    type: str
    reference_id: str | None = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    is_read: bool | None = None


class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
