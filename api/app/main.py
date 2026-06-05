from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.routes import auth_router, entries_router, projects_router, reports_router
from app.core.config import settings
import logging

logger = logging.getLogger("time_tracker")


def create_app() -> FastAPI:
    app = FastAPI(title="Time Tracker API", version="1.0.0", debug=settings.debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled error: %s", exc, exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error("Database error: %s", exc, exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Database error"})

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(projects_router)
    app.include_router(entries_router)
    app.include_router(reports_router)

    return app


app = create_app()
