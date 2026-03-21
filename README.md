<p align="center">
  <img src="frontend/public/logo-cropped.png" alt="PhotoGen" width="80" />
</p>

<h1 align="center">PhotoGen</h1>

<p align="center">
  Free, open-source passport photo maker powered by AI.<br/>
  Background removal, face detection, auto-cropping &mdash; no data stored, no account required.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/python-3.11+-green" alt="Python" />
  <img src="https://img.shields.io/badge/next.js-16-black" alt="Next.js" />
</p>

---

## Features

- **AI Background Removal** &mdash; BiRefNet-portrait model with alpha matting for clean hair edges
- **Face Detection** &mdash; OpenCV Haar cascades for reliable face positioning
- **Auto-Cropping** &mdash; Crops to exact government specs (head height, eye level, dimensions)
- **10+ Countries** &mdash; US, EU, UK, Canada, Australia, India, China, Japan, South Korea, Brazil
- **Manual Crop** &mdash; Fallback crop tool with oval face template and guide lines
- **Image Enhancement** &mdash; White balance correction and adaptive contrast (CLAHE)
- **Post-Processing** &mdash; Real-time brightness, contrast, saturation sliders
- **Print Sheet** &mdash; 4-up grid preview for photo center printing
- **100% Free** &mdash; No accounts, no watermarks, no data stored

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, react-easy-crop |
| Backend | Python, FastAPI, Uvicorn |
| AI/ML | rembg (BiRefNet-portrait), OpenCV (Haar cascades), Pillow |
| Enhancement | OpenCV CLAHE, white balance (gray-world algorithm) |

## Quick Start

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

The ML model (~170MB) downloads automatically on first request.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
photogen/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # FastAPI endpoints
│   │   ├── core/              # BG removal, face detection, cropping, enhancement
│   │   ├── services/          # Photo processing orchestrator
│   │   ├── models/            # Pydantic request/response schemas
│   │   └── data/              # Country spec loader
│   ├── Dockerfile             # Docker deployment (HuggingFace Spaces)
│   └── requirements.txt
├── frontend/
│   ├── app/                   # Next.js App Router entry
│   └── src/
│       ├── components/        # UI components + ManualCropModal
│       ├── hooks/             # useImageUpload, usePhotoProcess
│       ├── lib/               # API client, types, utils
│       └── constants/         # Photo requirement defaults
└── shared/
    └── photo_requirements.json
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/requirements` | All country photo specs |
| `GET` | `/api/requirements/:code` | Single country spec |
| `POST` | `/api/process` | Full processing pipeline |
| `POST` | `/api/detect-face` | Face detection only |
| `POST` | `/api/remove-background` | Background removal only |

Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs)

## Processing Pipeline

```
Upload Photo
    ↓
Face Detection (OpenCV Haar Cascades)
    ↓
Background Removal (BiRefNet-portrait + alpha matting)
    ↓
Auto-Crop to Country Specs
    ↓
Image Enhancement (white balance + adaptive CLAHE)
    ↓
Output (JPEG, 300 DPI, passport-compliant compression)
```

## Supported Countries

| Country | Dimensions | Head Height | Background |
|---------|-----------|-------------|------------|
| US Passport | 600x600 (2x2") | 50-69% | White |
| EU Passport | 413x531 (35x45mm) | 70-80% | White |
| UK Passport | 413x531 (35x45mm) | 70-80% | Light Gray |
| Canada | 413x531 (35x45mm) | 70-80% | White |
| Australia | 413x531 (35x45mm) | 70-80% | White |
| India | 413x531 (35x45mm) | 70-80% | White |
| China | 390x567 (33x48mm) | 70-80% | White |
| Japan | 413x531 (35x45mm) | 70-80% | White |
| South Korea | 413x531 (35x45mm) | 70-80% | White |
| Brazil | 413x531 (35x45mm) | 70-80% | White |

## Deployment

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Frontend | [Vercel](https://vercel.com) | 100GB bandwidth, edge CDN |
| Backend | [HuggingFace Spaces](https://huggingface.co/spaces) (Docker SDK) | 16GB RAM, 2 vCPU, 50GB disk |

## License

MIT
