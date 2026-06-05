import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = ZoneInfo("America/Sao_Paulo")


class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hours: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(TZ), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(TZ), onupdate=lambda: datetime.now(TZ), nullable=False)

    project = relationship("Project", back_populates="entries")
