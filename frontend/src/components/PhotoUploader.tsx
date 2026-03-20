'use client'

import { DragEvent, useRef, useState } from 'react'
import { useWebcam } from '@/hooks/useWebcam'
import Button from './ui/Button'

interface PhotoUploaderProps {
  onFileSelect: (file: File) => void
  previewUrl: string | null
  error: string | null
  onClear: () => void
}

export default function PhotoUploader({ onFileSelect, previewUrl, error, onClear }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const { videoRef, active: camActive, error: camError, start, stop, capture } = useWebcam()

  function handleFiles(files: FileList | null) {
    if (files && files[0]) onFileSelect(files[0])
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleCaptureAndStop() {
    const file = capture()
    if (file) {
      onFileSelect(file)
      stop()
      setShowWebcam(false)
    }
  }

  function openWebcam() {
    setShowWebcam(true)
    start()
  }

  function closeWebcam() {
    stop()
    setShowWebcam(false)
  }

  if (showWebcam) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {!camActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              {camError || 'Starting camera…'}
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 rounded-full border-2 border-white/60" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCaptureAndStop} disabled={!camActive} className="flex-1">
            Take Photo
          </Button>
          <Button variant="outline" onClick={closeWebcam}>
            Cancel
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">Position your face inside the oval outline</p>
      </div>
    )
  }

  if (previewUrl) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square max-w-64 mx-auto">
          <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
        </div>
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onClear}>
            Remove & upload new
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Drag & drop your photo here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse · JPEG, PNG, WebP · Max 15MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Button variant="outline" className="w-full" onClick={openWebcam}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Use Webcam
      </Button>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  )
}
