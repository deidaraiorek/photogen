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
      <div className="space-y-4 animate-fade-in">
        <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {!camActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
              {camError || 'Starting camera...'}
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-36 sm:w-40 sm:h-52 rounded-full border-2 border-white/40" />
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
        <p className="text-xs text-gray-400 text-center">Position your face inside the oval</p>
      </div>
    )
  }

  if (previewUrl) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square max-w-40 sm:max-w-52 mx-auto">
          <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Remove & re-upload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-150 ${
          dragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 hover:border-primary-300 hover:bg-blue-50/50'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary-50 p-2.5">
            <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Drop your photo here</p>
            <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
          </div>
          <span className="text-[11px] sm:text-[10px] text-gray-300 tracking-wide">All image formats up to 15 MB</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <button
        type="button"
        onClick={openWebcam}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        or use webcam
      </button>

      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 rounded-lg px-3 py-2 border border-red-100">
          {error}
        </div>
      )}
    </div>
  )
}
