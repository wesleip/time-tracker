from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.section_repository import SectionRepository
from app.schemas.section import SectionCreate, SectionUpdate


class SectionService:
    def __init__(self, repo: SectionRepository):
        self.repo = repo

    def list_all(self, user: User):
        return self.repo.list_all(user.id)

    def get_by_id(self, section_id: str, user: User):
        section = self.repo.get_by_id(section_id, user.id)
        if not section:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        return section

    def create(self, data: SectionCreate, user: User):
        payload = data.model_dump()
        payload["user_id"] = user.id
        return self.repo.create(payload)

    def update(self, section_id: str, data: SectionUpdate, user: User):
        section = self.repo.get_by_id(section_id, user.id)
        if not section:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        return self.repo.update(section, data.model_dump(exclude_unset=True))

    def delete(self, section_id: str, user: User):
        section = self.repo.get_by_id(section_id, user.id)
        if not section:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        self.repo.delete(section)

    def ensure_default(self, user: User):
        return self.repo.ensure_default(user.id)
