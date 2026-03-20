import base64
import io
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image

from app.core.background_removal import remove_background
from app.core.face_detection import detect_faces
from app.models.response import BackgroundRemoveResponse, FaceDetectResponse, FaceLocation, ProcessResponse
from app.services.photo_processor import process_photo

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024


@router.post("/process", response_model=ProcessResponse)
async def process_endpoint(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    options: str = Form(default="{}"),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 15MB.")

    try:
        opts = json.loads(options)
    except Exception:
        opts = {}

    try:
        result = process_photo(
            image_bytes=image_bytes,
            document_type=document_type.upper(),
            brightness=opts.get("brightness", 50),
            contrast=opts.get("contrast", 50),
            saturation=opts.get("saturation", 50),
            remove_bg=opts.get("remove_background", True),
            background_color=opts.get("background_color"),
            do_auto_enhance=opts.get("auto_enhance", True),
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/detect-face", response_model=FaceDetectResponse)
async def detect_face_endpoint(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    faces = detect_faces(image)

    return {
        "success": True,
        "faces_detected": len(faces),
        "face_locations": [FaceLocation(**f) for f in faces],
    }


@router.post("/remove-background", response_model=BackgroundRemoveResponse)
async def remove_bg_endpoint(
    file: UploadFile = File(...),
    background_color: str = Form(default="#FFFFFF"),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    result = remove_background(image, bg_color=background_color)

    buffer = io.BytesIO()
    result.save(buffer, format="JPEG", quality=92)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {"success": True, "processed_image": encoded}
