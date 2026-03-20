from pydantic import BaseModel


class ProcessMetadata(BaseModel):
    detected_faces: int
    face_confidence: float
    dimensions: dict
    file_size_kb: float
    compliant: bool
    warnings: list[str]
    document_type: str
    country: str
    document_name: str


class ProcessResponse(BaseModel):
    success: bool
    processed_image: str
    bg_removed_image: str | None = None
    metadata: ProcessMetadata
    processing_time_ms: float


class FaceLocation(BaseModel):
    x: int
    y: int
    width: int
    height: int
    confidence: float


class FaceDetectResponse(BaseModel):
    success: bool
    faces_detected: int
    face_locations: list[FaceLocation]


class BackgroundRemoveResponse(BaseModel):
    success: bool
    processed_image: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
