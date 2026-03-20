from pydantic import BaseModel, Field


class ProcessOptions(BaseModel):
    brightness: int = Field(default=50, ge=0, le=100)
    contrast: int = Field(default=50, ge=0, le=100)
    saturation: int = Field(default=50, ge=0, le=100)
    remove_background: bool = True
    background_color: str | None = None
    auto_enhance: bool = True
