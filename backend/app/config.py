from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "PhotoGen API"
    version: str = "1.0.0"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    temp_dir: str = "/tmp/photogen"

    class Config:
        env_file = ".env"


settings = Settings()
