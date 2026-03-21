import base64
import io
import time

from PIL import Image, ImageOps

from app.core.background_removal import remove_background
from app.core.cropping import auto_crop_passport, center_crop
from app.core.face_detection import get_primary_face
from app.core.image_enhancement import auto_enhance, enhance_image
from app.core.validator import compress_to_limit, validate_compliance
from app.data.photo_specs import get_spec


def process_photo(
    image_bytes: bytes,
    document_type: str,
    brightness: int = 50,
    contrast: int = 50,
    saturation: int = 50,
    remove_bg: bool = True,
    background_color: str | None = None,
    do_auto_enhance: bool = True,
) -> dict:
    start = time.time()

    spec = get_spec(document_type)
    if not spec:
        raise ValueError(f"Unknown document type: {document_type}")

    dims = spec["dimensions"]
    target_w = dims["width_px"]
    target_h = dims["height_px"]
    face_req = spec["face_requirements"]
    file_req = spec["file_requirements"]
    bg_color = background_color or spec["background"]["color"]

    image = Image.open(io.BytesIO(image_bytes))
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    if do_auto_enhance:
        image = auto_enhance(image)

    image = enhance_image(image, brightness=brightness, contrast=contrast, saturation=saturation)

    face = get_primary_face(image)
    face_detected = face is not None
    face_confidence = face["confidence"] if face else 0.0

    bg_removed_encoded = None
    if remove_bg:
        image = remove_background(image, bg_color=bg_color)
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=92)
        bg_removed_encoded = base64.b64encode(buf.getvalue()).decode("utf-8")

    if face:
        image = auto_crop_passport(
            image,
            face=face,
            target_width=target_w,
            target_height=target_h,
            head_height_percent=face_req["head_height_percent"],
            eye_level_percent=face_req["eye_level_percent"],
            bg_color=bg_color,
        )
    else:
        image = center_crop(image, target_w, target_h, bg_color=bg_color)

    compliance = validate_compliance(image, spec)
    image_bytes_out, _ = compress_to_limit(image, file_req.get("max_size_kb", 500))

    encoded = base64.b64encode(image_bytes_out).decode("utf-8")
    elapsed_ms = round((time.time() - start) * 1000, 1)

    warnings = compliance["warnings"][:]
    if not face_detected:
        warnings.insert(0, "No face detected — image was center-cropped. Please upload a clear frontal photo.")
    elif face_confidence < 0.7:
        warnings.insert(0, "Low face detection confidence. Results may be less accurate.")

    return {
        "success": True,
        "processed_image": encoded,
        "bg_removed_image": bg_removed_encoded,
        "metadata": {
            "detected_faces": 1 if face_detected else 0,
            "face_confidence": round(face_confidence, 3),
            "dimensions": compliance["dimensions"],
            "file_size_kb": compliance["file_size_kb"],
            "compliant": compliance["compliant"] and face_detected,
            "warnings": warnings,
            "document_type": document_type,
            "country": spec["country"],
            "document_name": spec["name"],
        },
        "processing_time_ms": elapsed_ms,
    }
