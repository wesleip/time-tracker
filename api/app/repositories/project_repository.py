from sqlalchemy.orm import Session

from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Project]:
        return self.db.query(Project).order_by(Project.created_at.desc()).all()

    def get_by_id(self, project_id: str) -> Project | None:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def create(self, data: dict) -> Project:
        project = Project(**data)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project: Project, data: dict) -> Project:
        for key, value in data.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
