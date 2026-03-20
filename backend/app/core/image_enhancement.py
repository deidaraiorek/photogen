import cv2
import numpy as np
from PIL import Image


def enhance_image(
    image: Image.Image,
    brightness: int = 50,
    contrast: int = 50,
    saturation: int = 50,
) -> Image.Image:
    img = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    alpha = max(0.5, min(2.0, contrast / 50.0))
    beta = int((brightness - 50) * 1.5)
    img_bgr = cv2.convertScaleAbs(img_bgr, alpha=alpha, beta=beta)

    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    sat_scale = max(0.0, min(2.5, saturation / 50.0))
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * sat_scale, 0, 255)
    img_bgr = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    return Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))


def _white_balance(img_bgr: np.ndarray) -> np.ndarray:
    avg_b, avg_g, avg_r = cv2.mean(img_bgr)[:3]
    avg_gray = (avg_b + avg_g + avg_r) / 3.0
    if avg_gray < 1:
        return img_bgr
    scale_b = avg_gray / max(avg_b, 1)
    scale_g = avg_gray / max(avg_g, 1)
    scale_r = avg_gray / max(avg_r, 1)
    if max(scale_b, scale_g, scale_r) > 1.3:
        return img_bgr
    result = img_bgr.astype(np.float32)
    result[:, :, 0] *= scale_b
    result[:, :, 1] *= scale_g
    result[:, :, 2] *= scale_r
    return np.clip(result, 0, 255).astype(np.uint8)


def auto_enhance(image: Image.Image) -> Image.Image:
    img = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    img_bgr = _white_balance(img_bgr)

    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    avg_l = l_channel.mean()
    if avg_l < 80:
        clip, blend = 2.0, 0.5
    elif avg_l < 120:
        clip, blend = 1.5, 0.4
    else:
        clip, blend = 0.8, 0.25

    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(16, 16))
    l_enhanced = clahe.apply(l_channel)
    l_blended = cv2.addWeighted(l_channel, 1 - blend, l_enhanced, blend, 0)
    enhanced = cv2.merge([l_blended, a_channel, b_channel])
    img_bgr = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    return Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
