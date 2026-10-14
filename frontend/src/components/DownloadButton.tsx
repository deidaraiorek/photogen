'use client'

import { useEffect, useRef, useState } from 'react'
import type { ProcessMetadata } from '@/lib/types'
import { base64ToBytes, base64ToObjectUrl, downloadBytes, formatFileSize, prepareJpegForDownload } from '@/lib/utils'
import Button from './ui/Button'

interface DownloadButtonProps {
  base64: string
  metadata: ProcessMetadata
  processingTimeMs?: number
  filter?: string
  minSizeKb?: number
  maxSizeKb?: number
}

const NEUTRAL_FILTER = 'brightness(100%) contrast(100%) saturate(100%)'

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not encode the photo.')),
      'image/jpeg',
      quality,
    )
  })
}

async function encodeWithinLimit(canvas: HTMLCanvasElement, maxSizeBytes?: number): Promise<Uint8Array> {
  for (let quality = 0.95; quality >= 0.1; quality -= 0.05) {
    const blob = await canvasToBlob(canvas, quality)
    if (!maxSizeBytes || blob.size <= maxSizeBytes) {
      return new Uint8Array(await blob.arrayBuffer())
    }
  }
  throw new Error(`Could not reduce the photo below ${formatFileSize((maxSizeBytes || 0) / 1024)}.`)
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = base64ToObjectUrl(base64)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read the processed photo.'))
    }
    image.src = url
  })
}

export default function DownloadButton({ base64, metadata, processingTimeMs, filter, minSizeKb, maxSizeKb }: DownloadButtonProps) {
  const [preparedDownload, setPreparedDownload] = useState<{ key: string; sizeKb: number } | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const generationRef = useRef(0)
  const inFlightRef = useRef(false)
  const mountedRef = useRef(true)
  const isNeutral = !filter || filter === NEUTRAL_FILTER
  const sourceBytes = base64ToBytes(base64)
  const downloadKey = `${base64.length}:${base64.slice(0, 16)}:${base64.slice(-16)}:${filter}:${minSizeKb}:${maxSizeKb}`
  const preparedSizeKb = preparedDownload?.key === downloadKey ? preparedDownload.sizeKb : null
  const expectedSizeKb = Math.max(sourceBytes.length / 1024, minSizeKb || 0)

  useEffect(() => () => {
    generationRef.current += 1
  }, [base64, filter, minSizeKb, maxSizeKb])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      generationRef.current += 1
    }
  }, [])

  async function handleDownload() {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setIsPreparing(true)
    const generation = ++generationRef.current
    const filename = `${metadata.document_type.toLowerCase().replace('_', '-')}-photo.jpg`
    const minSizeBytes = (minSizeKb || 0) * 1024
    const maxSizeBytes = maxSizeKb ? maxSizeKb * 1024 : undefined
    setDownloadError(null)

    try {
      const needsReencoding = !isNeutral || Boolean(maxSizeBytes && sourceBytes.length > maxSizeBytes)
      const finalBytes = await prepareJpegForDownload(
        sourceBytes,
        minSizeBytes,
        maxSizeBytes,
        needsReencoding ? async () => {
          const img = await loadImage(base64)
          if (generation !== generationRef.current) return sourceBytes
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Could not prepare the photo for download.')
          if (!isNeutral && filter) ctx.filter = filter
          ctx.drawImage(img, 0, 0)
          return encodeWithinLimit(canvas, maxSizeBytes)
        } : undefined,
      )
      if (generation !== generationRef.current) return

      setPreparedDownload({ key: downloadKey, sizeKb: finalBytes.length / 1024 })
      downloadBytes(finalBytes, filename)
    } catch (error) {
      if (generation === generationRef.current && mountedRef.current) {
        setDownloadError(error instanceof Error ? error.message : 'Could not prepare the photo for download.')
      }
    } finally {
      inFlightRef.current = false
      if (mountedRef.current) setIsPreparing(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-lg p-3 text-sm ${metadata.compliant ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{metadata.compliant ? '✅' : '⚠️'}</span>
          <div>
            <p className={`font-medium text-sm ${metadata.compliant ? 'text-green-800' : 'text-amber-800'}`}>
              {metadata.compliant ? 'Meets requirements' : 'Review recommendations'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {metadata.dimensions.width}x{metadata.dimensions.height}px · {formatFileSize(preparedSizeKb ?? expectedSizeKb)}{processingTimeMs ? ` · ${processingTimeMs.toFixed(0)}ms` : ''}
            </p>
          </div>
        </div>
      </div>

      {metadata.warnings.length > 0 && (
        <ul className="space-y-1">
          {metadata.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      {downloadError && <p className="text-xs text-red-600">{downloadError}</p>}

      <Button onClick={handleDownload} className="w-full" size="lg" loading={isPreparing}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Photo
      </Button>

      <p className="text-[11px] text-gray-300 text-center">
        {metadata.document_name} · {metadata.country}
      </p>
    </div>
  )
}
