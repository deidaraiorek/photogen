import cv2
import mediapipe as mp
import numpy as np
from PIL import Image

_FRONTAL_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
_PROFILE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

_mp_face = mp.solutions.face_detection
_mp_detector = None


def _get_mp_detector():
    global _mp_detector
    if _mp_detector is None:
        _mp_detector = _mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5)
    return _mp_detector


def _detect_mediapipe(image: Image.Image) -> list[dict]:
    img_array = np.array(image.convert("RGB"))
    ih, iw = img_array.shape[:2]
    detector = _get_mp_detector()
    results = detector.process(img_array)

    if not results.detections:
        return []

    faces = []
    for det in results.detections:
        bb = det.location_data.relative_bounding_box
        x = int(bb.xmin * iw)
        y = int(bb.ymin * ih)
        w = int(bb.width * iw)
        h = int(bb.height * ih)
        x = max(0, x)
        y = max(0, y)
        w = min(w, iw - x)
        h = min(h, ih - y)
        if w > 0 and h > 0:
            faces.append({
                "x": x,
                "y": y,
                "width": w,
                "height": h,
                "confidence": round(det.score[0], 3),
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
