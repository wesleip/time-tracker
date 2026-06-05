from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/time_tracker"
    debug: bool = False
    cors_origins: str = "http://localhost:5173,http://localhost:8080"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
