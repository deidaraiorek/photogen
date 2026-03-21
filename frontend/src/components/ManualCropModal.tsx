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
  const w = 300
  const h = w / aspect
  const cx = w / 2

  const eyeY = (1 - eyePct) * h
  const ovalH = headPct * h
  const ovalW = ovalH * 0.7
  const ovalCY = eyeY
  const crownY = ovalCY - ovalH / 2
  const chinY = ovalCY + ovalH / 2

  const labelX = w - 6

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <ellipse cx="${cx}" cy="${ovalCY}" rx="${ovalW / 2}" ry="${ovalH / 2}"
      fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-dasharray="8 4"/>
    <line x1="6" y1="${eyeY}" x2="${w - 6}" y2="${eyeY}"
      stroke="rgba(250,204,21,1)" stroke-width="1.5" stroke-dasharray="6 3"/>
    <text x="${labelX}" y="${eyeY - 5}" fill="rgba(250,204,21,1)" font-size="9" font-weight="bold" font-family="sans-serif" text-anchor="end">EYE LINE</text>
    <line x1="${cx - ovalW / 2 - 15}" y1="${crownY}" x2="${cx + ovalW / 2 + 15}" y2="${crownY}"
      stroke="rgba(74,222,128,0.9)" stroke-width="1.5" stroke-dasharray="6 3"/>
    <text x="${labelX}" y="${crownY + 12}" fill="rgba(74,222,128,0.9)" font-size="8" font-weight="bold" font-family="sans-serif" text-anchor="end">TOP OF HEAD</text>
    <line x1="${cx - ovalW / 2 - 15}" y1="${chinY}" x2="${cx + ovalW / 2 + 15}" y2="${chinY}"
      stroke="rgba(74,222,128,0.9)" stroke-width="1.5" stroke-dasharray="6 3"/>
    <text x="${labelX}" y="${chinY - 5}" fill="rgba(74,222,128,0.9)" font-size="8" font-weight="bold" font-family="sans-serif" text-anchor="end">CHIN</text>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-semibold text-sm">Manual Crop</h3>
            <p className="text-gray-400 text-xs mt-0.5">Drag to move, scroll to zoom</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-gray-900" style={{ height: '55vh', minHeight: 280 }}>
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
              containerStyle: { background: '#1e293b' },
              cropAreaStyle: {
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '6px',
                backgroundImage: overlaySvg,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              },
            }}
          />
        </div>

        <div className="px-5 py-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">-</span>
            <input
              type="range"
              min={0.3}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-400">+</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
