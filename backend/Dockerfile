FROM python:3.11-slim

RUN useradd -m -u 1000 user

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /home/user/.u2net && chown -R user:user /home/user/.u2net
USER user
ENV PATH="/home/user/.local/bin:$PATH"
ENV HOME="/home/user"

RUN python -c "from rembg import new_session; new_session('birefnet-portrait')"

RUN mkdir -p /home/user/models && python -c "import urllib.request; urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite', '/home/user/models/blaze_face_short_range.tflite')"

COPY --chown=user . /app

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
