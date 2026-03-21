from PIL import Image


def auto_crop_passport(
    image: Image.Image,
    face: dict,
    target_width: int,
    target_height: int,
    head_height_percent: float,
    eye_level_percent: float,
    bg_color: str = "#FFFFFF",
) -> Image.Image:
    iw, ih = image.size

    face_x = face["x"]
    face_y = face["y"]
    face_w = face["width"]
    face_h = face["height"]

    target_head_px = int(target_height * head_height_percent * 0.75)
    scale = target_head_px / face_h
    eye_y_orig = face.get("eye_y") or (face_y + face_h * 0.35)

    scaled_img = image.resize((int(iw * scale), int(ih * scale)), Image.LANCZOS)
    scaled_w, scaled_h = scaled_img.size

    face_cx_orig = face_x + face_w / 2.0

    eye_y_scaled = eye_y_orig * scale
    face_cx_scaled = face_cx_orig * scale

    eye_from_top = int(target_height * (1.0 - eye_level_percent))

    crop_y = int(eye_y_scaled - eye_from_top)
    crop_x = int(face_cx_scaled - target_width / 2)

    r = int(bg_color[1:3], 16)
    g = int(bg_color[3:5], 16)
    b = int(bg_color[5:7], 16)
    canvas = Image.new("RGB", (target_width, target_height), (r, g, b))

    paste_x = max(0, -crop_x)
    paste_y = max(0, -crop_y)
    src_x = max(0, crop_x)
    src_y = max(0, crop_y)
    src_x2 = min(scaled_w, crop_x + target_width)
    src_y2 = min(scaled_h, crop_y + target_height)

    if src_x2 > src_x and src_y2 > src_y:
        region = scaled_img.crop((src_x, src_y, src_x2, src_y2))
        canvas.paste(region, (paste_x, paste_y))

    return canvas


def center_crop(image: Image.Image, target_width: int, target_height: int, bg_color: str = "#FFFFFF") -> Image.Image:
    iw, ih = image.size
    r = int(bg_color[1:3], 16)
    g = int(bg_color[3:5], 16)
    b = int(bg_color[5:7], 16)

    scale = max(target_width / iw, target_height / ih)
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    resized = image.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGB", (target_width, target_height), (r, g, b))
    paste_x = (target_width - new_w) // 2
    paste_y = (target_height - new_h) // 2
    canvas.paste(resized, (paste_x, paste_y))
    return canvas
