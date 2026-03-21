import os
import urllib.request

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image

_FRONTAL_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
_PROFILE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
_MODEL_NAME = "blaze_face_short_range.tflite"
_SEARCH_DIRS = [
    os.path.join(os.path.expanduser("~"), "models"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"),
]
_MODEL_PATH = next((os.path.join(d, _MODEL_NAME) for d in _SEARCH_DIRS if os.path.exists(os.path.join(d, _MODEL_NAME))), os.path.join(_SEARCH_DIRS[0], _MODEL_NAME))

_mp_detector = None


def _ensure_model():
    if not os.path.exists(_MODEL_PATH):
        os.makedirs(os.path.dirname(_MODEL_PATH), exist_ok=True)
        urllib.request.urlretrieve(_MODEL_URL, _MODEL_PATH)


def _get_mp_detector():
    global _mp_detector
    if _mp_detector is None:
        _ensure_model()
        options = mp.tasks.vision.FaceDetectorOptions(
            base_options=mp.tasks.BaseOptions(model_asset_path=_MODEL_PATH),
            min_detection_confidence=0.5,
        )
        _mp_detector = mp.tasks.vision.FaceDetector.create_from_options(options)
    return _mp_detector


def _detect_mediapipe(image: Image.Image) -> list[dict]:
    img_array = np.array(image.convert("RGB"))
    ih, iw = img_array.shape[:2]
    detector = _get_mp_detector()
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_array)
    results = detector.detect(mp_image)

    if not results.detections:
        return []

    faces = []
    for det in results.detections:
        bb = det.bounding_box
        x = max(0, bb.origin_x)
        y = max(0, bb.origin_y)
        w = min(bb.width, iw - x)
        h = min(bb.height, ih - y)
        if w > 0 and h > 0:
            faces.append({
                "x": x,
                "y": y,
                "width": w,
                "height": h,
                "confidence": round(det.categories[0].score, 3),
            })

    faces.sort(key=lambda f: f["width"] * f["height"], reverse=True)
    return faces


def _detect_haar(image: Image.Image) -> list[dict]:
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


def detect_faces(image: Image.Image) -> list[dict]:
    faces = _detect_mediapipe(image)
    if faces:
        return faces
    return _detect_haar(image)


def get_primary_face(image: Image.Image) -> dict | None:
    faces = detect_faces(image)
    return faces[0] if faces else None
