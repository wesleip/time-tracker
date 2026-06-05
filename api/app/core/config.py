from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/time_tracker"
    debug: bool = False
    cors_origins: str = "http://localhost:5173,http://localhost:8080"
    jwt_secret: str = "change-this-secret-in-production"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
