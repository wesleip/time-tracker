from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, field_validator

TZ = ZoneInfo("America/Sao_Paulo")


def ensure_tz(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=TZ)
    return dt.astimezone(TZ)


class TimeEntryBase(BaseModel):
    project_id: str
    description: str | None = None
    hours: float
    date: datetime

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v <= 0 or v > 24:
            raise ValueError("hours must be between 0 and 24")
        return round(v, 2)

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: datetime) -> datetime:
        return ensure_tz(v)


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    project_id: str | None = None
    description: str | None = None
    hours: float | None = None
    date: datetime | None = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: datetime | None) -> datetime | None:
        if v is None:
            return v
        return ensure_tz(v)


class TimeEntryResponse(TimeEntryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimeEntryWithProject(TimeEntryResponse):
    project_name: str
    project_color: str
