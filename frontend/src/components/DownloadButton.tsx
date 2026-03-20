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
    <div className="space-y-4">
      <div className={`rounded-lg p-3 text-sm ${metadata.compliant ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{metadata.compliant ? '✅' : '⚠️'}</span>
          <div>
            <p className={`font-medium ${metadata.compliant ? 'text-green-900' : 'text-yellow-900'}`}>
              {metadata.compliant ? 'Photo meets requirements' : 'Review recommendations'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {metadata.dimensions.width}×{metadata.dimensions.height}px · {formatFileSize(metadata.file_size_kb)}{processingTimeMs ? ` · ${processingTimeMs.toFixed(0)}ms` : ''}
            </p>
          </div>
        </div>
      </div>

      {metadata.warnings.length > 0 && (
        <ul className="space-y-1">
          {metadata.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-yellow-700">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      <Button onClick={handleDownload} className="w-full" size="lg">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Photo
      </Button>

      <p className="text-xs text-gray-400 text-center">
        {metadata.document_name} · {metadata.country}
      </p>
    </div>
  )
}
