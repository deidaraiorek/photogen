'use client'

import type { ProcessMetadata } from '@/lib/types'
import { base64ToObjectUrl, formatFileSize } from '@/lib/utils'
import Button from './ui/Button'

interface DownloadButtonProps {
  base64: string
  metadata: ProcessMetadata
  processingTimeMs?: number
  filter?: string
}

export default function DownloadButton({ base64, metadata, processingTimeMs, filter }: DownloadButtonProps) {
  function handleDownload() {
    const filename = `${metadata.document_type.toLowerCase().replace('_', '-')}-photo.jpg`
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (filter) ctx.filter = filter
      ctx.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.download = filename
      link.click()
    }
    img.src = base64ToObjectUrl(base64)
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
              {metadata.dimensions.width}x{metadata.dimensions.height}px · {formatFileSize(metadata.file_size_kb)}{processingTimeMs ? ` · ${processingTimeMs.toFixed(0)}ms` : ''}
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

      <Button onClick={handleDownload} className="w-full" size="lg">
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
