from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def list_all(self, user: User):
        return self.repo.list_all(user.id)

    def get_by_id(self, project_id: str, user: User):
        project = self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    def create(self, data: ProjectCreate, user: User):
        payload = data.model_dump()
        payload["user_id"] = user.id
        return self.repo.create(payload)

    def update(self, project_id: str, data: ProjectUpdate, user: User):
        project = self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return self.repo.update(project, data.model_dump(exclude_unset=True))

    def delete(self, project_id: str, user: User):
        project = self.repo.get_by_id(project_id, user.id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        self.repo.delete(project)
