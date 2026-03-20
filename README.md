# PhotoGen — Free Passport Photo Maker

A free, fully-featured passport photo creator with AI-powered background removal, face detection, and auto-cropping. Works offline with no API costs.

## Features

- AI background removal (rembg / U2-Net)
- Face detection & auto-crop to exact government specs
- Lighting, contrast, saturation adjustments
- 10+ countries (US Passport/Visa, EU, UK, Canada, Australia, India, China, Japan, Germany)
- Before/after comparison slider
- Instant digital download
- Webcam capture support

## Quick Start

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## Project Structure

```
photogen/
├── frontend/          # Next.js 16, TypeScript, Tailwind CSS
├── backend/           # Python FastAPI + AI processing
└── shared/            # Photo requirements JSON (all countries)
```

## API

- `GET  /api/requirements`          — all country specs
- `POST /api/process`               — process photo (main endpoint)
- `POST /api/detect-face`           — face detection only
- `POST /api/remove-background`     — background removal only
- Docs at http://localhost:8000/docs

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend  | Python, FastAPI, Uvicorn |
| Face detection | OpenCV Haar cascades |
| Background removal | rembg (U2-Net model) |
| Image processing | OpenCV, Pillow |

## First Run Note

On first use, rembg will download the U2-Net model (~170MB). Subsequent runs use the cached model.
