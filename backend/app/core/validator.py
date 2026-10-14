import io
import math

from PIL import Image


def validate_compliance(image: Image.Image, spec: dict, file_size_bytes: int | None = None) -> dict:
    warnings = []
    file_req = spec.get("file_requirements", {})
    dims = spec.get("dimensions", {})

    w, h = image.size
    if w != dims.get("width_px") or h != dims.get("height_px"):
        warnings.append(f"Dimensions {w}x{h} differ from required {dims.get('width_px')}x{dims.get('height_px')}")

    if file_size_bytes is None:
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        file_size_bytes = buffer.tell()

    size_kb = file_size_bytes / 1024
    min_kb = file_req.get("min_size_kb")
    max_kb = file_req.get("max_size_kb", 500)
    if min_kb is not None and file_size_bytes < min_kb * 1024:
        warnings.append(f"File size {size_kb:.0f}KB is below minimum {min_kb}KB")
    if size_kb > max_kb:
        warnings.append(f"File size {size_kb:.0f}KB exceeds maximum {max_kb}KB")

    return {
        "compliant": len(warnings) == 0,
        "warnings": warnings,
        "file_size_kb": round(size_kb, 1),
        "dimensions": {"width": w, "height": h},
    }


def _pad_jpeg_to_minimum(image_bytes: bytes, min_size_bytes: int) -> bytes:
    """Pad a JPEG with valid comment segments without changing its pixels."""
    if len(image_bytes) >= min_size_bytes:
        return image_bytes
    if not image_bytes.endswith(b"\xff\xd9"):
        raise ValueError("JPEG is missing its end-of-image marker")

    bytes_needed = min_size_bytes - len(image_bytes)
    segments = []
    while bytes_needed > 0:
        payload_size = min(65_533, max(0, bytes_needed - 4))
        segments.append(b"\xff\xfe" + (payload_size + 2).to_bytes(2, "big") + bytes(payload_size))
        bytes_needed -= payload_size + 4

    return image_bytes[:-2] + b"".join(segments) + image_bytes[-2:]


def compress_to_limits(
    image: Image.Image,
    max_size_kb: int,
    min_size_kb: int | None = None,
) -> tuple[bytes, int]:
    for quality in range(95, 30, -5):
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True, dpi=(300, 300), subsampling=0)
        image_bytes = buffer.getvalue()
        if len(image_bytes) <= max_size_kb * 1024:
            if min_size_kb is not None:
                image_bytes = _pad_jpeg_to_minimum(image_bytes, math.ceil(min_size_kb * 1024))
            return image_bytes, quality

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=35, optimize=True, dpi=(300, 300), subsampling=0)
    image_bytes = buffer.getvalue()
    if min_size_kb is not None:
        image_bytes = _pad_jpeg_to_minimum(image_bytes, math.ceil(min_size_kb * 1024))
    return image_bytes, 35


def compress_to_limit(image: Image.Image, max_size_kb: int) -> tuple[bytes, int]:
    return compress_to_limits(image, max_size_kb)
