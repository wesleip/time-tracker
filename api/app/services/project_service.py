from fastapi import HTTPException, status

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def list_all(self):
        return self.repo.list_all()

    def get_by_id(self, project_id: str):
        project = self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    def create(self, data: ProjectCreate):
        return self.repo.create(data.model_dump())

    def update(self, project_id: str, data: ProjectUpdate):
        project = self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return self.repo.update(project, data.model_dump(exclude_unset=True))

    def delete(self, project_id: str):
        project = self.repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        self.repo.delete(project)
