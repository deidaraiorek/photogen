<div align="center">

<img src="frontend/public/logo-cropped.png" alt="PhotoGen" width="80" />

# PhotoGen

**Free, open-source passport photo maker powered by AI.**

Background removal, face detection, and auto-cropping for 10+ countries — no data stored, no account required.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

[Demo](#demo) · [Features](#features) · [Getting Started](#getting-started) · [Supported Documents](#supported-documents) · [Tech Stack](#tech-stack) · [API](#api) · [Deployment](#deployment) · [License](#license)

</div>

---

## Demo

<!--
  Replace the placeholder below with your video demo.
  Upload an .mp4 to a GitHub issue or drag it into the README editor,
  then paste the resulting URL below.
-->

https://github.com/user-attachments/assets/REPLACE_WITH_YOUR_VIDEO_ID

> **Add your demo video here.** Upload an `.mp4` via GitHub (drag into an issue or PR), then replace the URL above.

---

## Features

- **AI Face Detection** — MediaPipe BlazeFace primary, Haar cascade fallback
- **Background Removal** — BiRefNet-portrait model with alpha matting for clean hair edges
- **Auto-Crop** — Crops to exact government specs (head height %, eye position, dimensions)
- **Image Enhancement** — White balance correction + adaptive CLAHE contrast
- **Post-Processing** — Real-time brightness, contrast, and saturation sliders
- **Manual Crop** — Fallback tool with oval face template and alignment guides
- **Before / After** — Side-by-side comparison slider
- **Print Sheet** — 4-up grid layout ready for photo center printing
- **Wide Format Support** — HEIC, AVIF, JPEG, PNG, WebP, BMP
- **Compliance Validation** — Checks dimensions, head size, eye position, and file size
- **300 DPI Output** — Publication-quality JPEG export
- **100% Free** — No accounts, no watermarks, no data stored

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The ML model (~170MB BiRefNet) downloads automatically on first request.

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Processing Pipeline

```
Upload Photo
    ↓
Face Detection (MediaPipe BlazeFace → Haar cascade fallback)
    ↓
Background Removal (BiRefNet-portrait + alpha matting)
    ↓
Auto-Crop to Country Specs
    ↓
Image Enhancement (white balance + adaptive CLAHE)
    ↓
Output (JPEG, 300 DPI, passport-compliant compression)
```

---

## Supported Documents

| Document | Country | Size | Head Height | Background |
|---|---|---|---|---|
| US Passport | United States | 2×2″ (600×600px) | 50–69% | White |
| US Visa | United States | 2×2″ (600×600px) | 50–69% | White |
| EU Passport | EU / Schengen | 35×45mm (413×531px) | 70–80% | Light Gray |
| UK Passport | United Kingdom | 35×45mm (413×531px) | 70–80% | Light Gray |
| Canada Passport | Canada | 35×45mm (420×540px) | 71% | White |
| Australia Passport | Australia | 35×45mm (413×531px) | 75% | White |
| India Passport | India | 35×45mm (413×531px) | 75% | White |
| China Visa | China | 33×48mm (390×567px) | 70% | White |
| Japan Passport | Japan | 35×45mm (413×531px) | 70% | White |
| Germany Passport | Germany | 35×45mm (413×531px) | 75% | Light Gray |

---

## Tech Stack

### Backend

| Library | Purpose |
|---|---|
| FastAPI + Uvicorn | API server |
| MediaPipe | Face detection (BlazeFace Tasks API) |
| OpenCV | Haar cascade fallback |
| rembg (BiRefNet) | Background removal |
| PyMatting | Alpha matting |
| Pillow + pillow-heif | Image I/O including HEIC |
| scikit-image | CLAHE enhancement |

### Frontend

| Library | Purpose |
|---|---|
| Next.js 16 + React 19 | App framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| react-easy-crop | Manual crop modal |
| Axios | HTTP client |

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/process` | Full processing pipeline |
| `POST` | `/api/detect-face` | Face detection only |
| `POST` | `/api/remove-background` | Background removal only |
| `GET` | `/api/requirements` | All country photo specs |
| `GET` | `/api/requirements/{code}` | Single country spec |
| `GET` | `/api/health` | Health check |

---

## Project Structure

```
photogen/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI endpoints
│   │   ├── core/            # Face detection, cropping, bg removal, enhancement
│   │   ├── services/        # Processing orchestrator
│   │   ├── models/          # Pydantic schemas
│   │   └── data/            # Country specs loader
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router
│   └── src/
│       ├── components/      # UI components
│       ├── hooks/           # useImageUpload, usePhotoProcess
│       ├── lib/             # API client, types, utils
│       └── constants/       # Defaults
└── shared/
    └── photo_requirements.json
```

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Edge CDN, auto-deploy from `main` |
| Backend | [HuggingFace Spaces](https://huggingface.co/spaces) | Docker container, 16GB RAM, 2 vCPU |

The backend includes a `Dockerfile` configured for HuggingFace Spaces with pre-downloaded models.

---

## License

[MIT](LICENSE)
