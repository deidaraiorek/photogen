import cv2
import numpy as np
from PIL import Image

_FRONTAL_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
_PROFILE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def detect_faces(image: Image.Image) -> list[dict]:
    img_array = np.array(image.convert("RGB"))
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    gray = cv2.equalizeHist(gray)
    ih, iw = gray.shape

    faces = _FRONTAL_CASCADE.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=4,
        minSize=(int(iw * 0.08), int(ih * 0.08)),
        flags=cv2.CASCADE_SCALE_IMAGE,
    )

    if len(faces) == 0:
        faces = _PROFILE_CASCADE.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=3,
            minSize=(int(iw * 0.06), int(ih * 0.06)),
        )

    if len(faces) == 0:
        return []

    result = []
    for x, y, w, h in faces:
        result.append({
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "confidence": 0.85,
        })

    result.sort(key=lambda f: f["width"] * f["height"], reverse=True)
    return result


def get_primary_face(image: Image.Image) -> dict | None:
    faces = detect_faces(image)
    return faces[0] if faces else None
