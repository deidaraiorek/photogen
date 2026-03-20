'use client'

import { useCallback, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { PhotoSpec } from '@/lib/types'

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ManualCropModalProps {
  imageSrc: string
  spec: PhotoSpec
  bgColor: string
  onApply: (base64: string) => void
  onClose: () => void
}

function buildOverlaySvg(aspect: number, headPct: number, eyePct: number): string {
  const w = 200
  const h = w / aspect

  const eyeFromTop = (1 - eyePct) * h
  const ovalH = headPct * h
  const ovalW = ovalH * 0.67
  const ovalCY = eyeFromTop

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <ellipse cx="${w / 2}" cy="${ovalCY}" rx="${ovalW / 2}" ry="${ovalH / 2}"
      fill="none" stroke="rgba(147,197,253,0.85)" stroke-width="1.5" stroke-dasharray="5 3"/>
    <line x1="${w / 2 - ovalW / 2 - 6}" y1="${eyeFromTop}" x2="${w / 2 + ovalW / 2 + 6}" y2="${eyeFromTop}"
      stroke="rgba(147,197,253,0.7)" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="${w / 2 + ovalW / 2 + 8}" y="${eyeFromTop + 3}" fill="rgba(147,197,253,0.9)" font-size="6" font-weight="bold" font-family="sans-serif">eyes</text>
  </svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export default function ManualCropModal({ imageSrc, spec, bgColor, onApply, onClose }: ManualCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.5)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const aspect = spec.dimensions.width_px / spec.dimensions.height_px

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const overlaySvg = useMemo(
    () => buildOverlaySvg(aspect, spec.face_requirements.head_height_percent, spec.face_requirements.eye_level_percent),
    [aspect, spec.face_requirements.head_height_percent, spec.face_requirements.eye_level_percent]
  )

  function handleApply() {
    if (!croppedAreaPixels) return
    const img = new Image()
    img.onload = () => {
      const targetW = spec.dimensions.width_px
      const targetH = spec.dimensions.height_px
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')!
      const r = parseInt(bgColor.slice(1, 3), 16)
      const g = parseInt(bgColor.slice(3, 5), 16)
      const b = parseInt(bgColor.slice(5, 7), 16)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(0, 0, targetW, targetH)
      ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, targetW, targetH)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      onApply(dataUrl.split(',')[1])
    }
    img.src = imageSrc
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <h3 className="text-white font-medium text-sm">Manual Crop</h3>
            <p className="text-white/40 text-xs mt-0.5">Drag to move, scroll to zoom</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-gray-950" style={{ height: '60vh', minHeight: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
            minZoom={0.3}
            maxZoom={4}
            showGrid={false}
            style={{
              containerStyle: { background: '#0a0a14' },
              cropAreaStyle: {
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '4px',
                backgroundImage: overlaySvg,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              },
            }}
          />
        </div>

        <div className="px-4 py-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">-</span>
            <input
              type="range"
              min={0.3}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-white/40 text-xs">+</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/15 text-white/70 text-sm hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
