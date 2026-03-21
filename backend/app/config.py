from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "PhotoGen API"
    version: str = "1.0.0"
    cors_origins: list[str] = ["*"]
    temp_dir: str = "/tmp/photogen"

    class Config:
        env_file = ".env"


settings = Settings()
