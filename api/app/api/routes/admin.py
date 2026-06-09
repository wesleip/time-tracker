from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.project import Project
from app.models.time_entry import TimeEntry
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


# --- Schemas ---

class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_user(cls, user: User) -> "AdminUserResponse":
        return cls(
            id=user.id,
            email=user.email,
            name=user.name,
            is_admin=user.is_admin,
            created_at=user.created_at.isoformat(),
        )


class AdminProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    color: str
    owner_id: str | None
    owner_name: str | None
    owner_email: str | None
    created_at: str


class AdminTimeLogResponse(BaseModel):
    id: str
    hours: float
    date: str
    description: str | None
    project_id: str
    project_name: str
    owner_id: str | None
    owner_name: str | None


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_projects: int
    total_entries: int
    total_hours: float


# --- Endpoints ---

@router.get("/overview", response_model=AdminOverviewResponse)
def overview(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_projects = db.query(func.count(Project.id)).scalar()
    total_entries = db.query(func.count(TimeEntry.id)).scalar()
    total_hours = db.query(func.coalesce(func.sum(TimeEntry.hours), 0.0)).scalar()
    return AdminOverviewResponse(
        total_users=total_users,
        total_projects=total_projects,
        total_entries=total_entries,
        total_hours=float(total_hours),
    )


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [AdminUserResponse.from_orm_user(u) for u in users]


@router.patch("/users/{user_id}/toggle-admin", response_model=AdminUserResponse)
def toggle_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own admin status")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return AdminUserResponse.from_orm_user(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/projects", response_model=list[AdminProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    rows = (
        db.query(Project, User)
        .outerjoin(User, Project.user_id == User.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return [
        AdminProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            color=p.color,
            owner_id=u.id if u else None,
            owner_name=u.name if u else None,
            owner_email=u.email if u else None,
            created_at=p.created_at.isoformat(),
        )
        for p, u in rows
    ]


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()


@router.get("/timelogs", response_model=list[AdminTimeLogResponse])
def list_timelogs(
    user_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = (
        db.query(TimeEntry, Project, User)
        .join(Project, TimeEntry.project_id == Project.id)
        .outerjoin(User, Project.user_id == User.id)
    )
    if user_id:
        query = query.filter(Project.user_id == user_id)
    rows = query.order_by(TimeEntry.date.desc()).all()
    return [
        AdminTimeLogResponse(
            id=e.id,
            hours=e.hours,
            date=e.date.isoformat(),
            description=e.description,
            project_id=p.id,
            project_name=p.name,
            owner_id=u.id if u else None,
            owner_name=u.name if u else None,
        )
        for e, p, u in rows
    ]
