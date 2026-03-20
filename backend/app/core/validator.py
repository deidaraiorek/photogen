from PIL import Image
import io


def validate_compliance(image: Image.Image, spec: dict) -> dict:
    warnings = []
    file_req = spec.get("file_requirements", {})
    dims = spec.get("dimensions", {})

    w, h = image.size
    if w != dims.get("width_px") or h != dims.get("height_px"):
        warnings.append(f"Dimensions {w}x{h} differ from required {dims.get('width_px')}x{dims.get('height_px')}")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    size_kb = buffer.tell() / 1024
    max_kb = file_req.get("max_size_kb", 500)
    if size_kb > max_kb:
        warnings.append(f"File size {size_kb:.0f}KB exceeds maximum {max_kb}KB")

    return {
        "compliant": len(warnings) == 0,
        "warnings": warnings,
        "file_size_kb": round(size_kb, 1),
        "dimensions": {"width": w, "height": h},
    }


def compress_to_limit(image: Image.Image, max_size_kb: int) -> tuple[bytes, int]:
    for quality in range(95, 30, -5):
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True, dpi=(300, 300), subsampling=0)
        size = buffer.tell()
        if size <= max_size_kb * 1024:
            return buffer.getvalue(), quality
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=35, optimize=True, dpi=(300, 300), subsampling=0)
    return buffer.getvalue(), 35
