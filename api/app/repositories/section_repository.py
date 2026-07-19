from sqlalchemy.orm import Session

from app.models.section import Section


class SectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self, user_id: str) -> list[Section]:
        return self.db.query(Section).filter(Section.user_id == user_id).order_by(Section.order, Section.created_at).all()

    def get_by_id(self, section_id: str, user_id: str) -> Section | None:
        return self.db.query(Section).filter(Section.id == section_id, Section.user_id == user_id).first()

    def get_default(self, user_id: str) -> Section | None:
        return self.db.query(Section).filter(Section.user_id == user_id, Section.name == "Geral").first()

    def create(self, data: dict) -> Section:
        section = Section(**data)
        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)
        return section

    def update(self, section: Section, data: dict) -> Section:
        for key, value in data.items():
            setattr(section, key, value)
        self.db.commit()
        self.db.refresh(section)
        return section

    def delete(self, section: Section) -> None:
        self.db.delete(section)
        self.db.commit()

    def ensure_default(self, user_id: str) -> Section:
        default = self.get_default(user_id)
        if not default:
            default = self.create({"user_id": user_id, "name": "Geral", "color": "#6366f1", "order": 0})
        return default
