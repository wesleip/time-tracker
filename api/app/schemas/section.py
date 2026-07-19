from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SectionBase(BaseModel):
    name: str
    color: str = "#6366f1"


class SectionCreate(SectionBase):
    pass


class SectionUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    order: int | None = None


class SectionResponse(SectionBase):
    id: str
    user_id: str
    order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
