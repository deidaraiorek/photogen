from rembg import remove, new_session
from PIL import Image
import numpy as np
import cv2
import io

_session = None

def _get_session():
    global _session
    if _session is None:
        _session = new_session("birefnet-portrait")
    return _session


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    img_bytes = io.BytesIO()
    image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    r = int(bg_color[1:3], 16)
    g = int(bg_color[3:5], 16)
    b = int(bg_color[5:7], 16)

    output_bytes = remove(
        img_bytes.read(),
        session=_get_session(),
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=3,
        post_process_mask=True,
        bgcolor=(r, g, b, 255),
    )
    output = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

    alpha_np = np.array(output.split()[3])

    _, binary = cv2.threshold(alpha_np, 10, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = np.argmax(areas) + 1
        alpha_np = np.where(labels == largest, alpha_np, 0).astype(np.uint8)

    alpha_smooth = cv2.GaussianBlur(alpha_np, (3, 3), 0)
    alpha_img = Image.fromarray(alpha_smooth)

    background = Image.new("RGBA", output.size, (r, g, b, 255))
    output.putalpha(alpha_img)
    background.paste(output, mask=alpha_img)

    return background.convert("RGB")
