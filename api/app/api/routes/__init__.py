from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.entries import router as entries_router
from app.api.routes.projects import router as projects_router
from app.api.routes.reports import router as reports_router

__all__ = ["admin_router", "auth_router", "projects_router", "entries_router", "reports_router"]
