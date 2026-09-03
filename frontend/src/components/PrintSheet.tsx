'use client'

import { useMemo, useState } from 'react'
import type { PhotoSpec } from '@/lib/types'
import { PAPER_SIZES, computePrintSheetLayout, renderPrintSheet } from '@/lib/printSheet'
import Button from './ui/Button'

interface PrintSheetProps {
  imageSrc: string
  spec: PhotoSpec
  filter?: string
}

export default function PrintSheet({ imageSrc, spec, filter }: PrintSheetProps) {
  const [paperId, setPaperId] = useState(PAPER_SIZES[0].id)
  const [downloading, setDownloading] = useState(false)

  const paper = PAPER_SIZES.find((p) => p.id === paperId) || PAPER_SIZES[0]
  const layout = useMemo(
    () => computePrintSheetLayout(paper, spec.dimensions.width_mm, spec.dimensions.height_mm),
    [paper, spec.dimensions.width_mm, spec.dimensions.height_mm]
  )

  async function handleDownload() {
    setDownloading(true)
    try {
      const dataUrl = await renderPrintSheet(imageSrc, paper, layout, spec.dimensions.dpi)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `print-sheet-${paper.id}.jpg`
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const previewAspect = paper.width_mm / paper.height_mm

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {PAPER_SIZES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPaperId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              p.id === paperId
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {layout.count === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          This photo doesn&apos;t fit on the selected paper size.
        </p>
      ) : (
        <>
          <div
            className="mx-auto bg-gray-50 border border-gray-200 rounded-lg p-2"
            style={{ aspectRatio: previewAspect, maxWidth: previewAspect >= 1 ? '100%' : 260 }}
          >
            <div
              className="relative w-full h-full bg-white shadow-sm rounded overflow-hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                gap: `${(layout.gutterMm / paper.height_mm) * 100}% ${(layout.gutterMm / paper.width_mm) * 100}%`,
                padding: `${(layout.offsetYMm / paper.height_mm) * 100}% ${(layout.offsetXMm / paper.width_mm) * 100}%`,
              }}
            >
              {Array.from({ length: layout.count }).map((_, i) => (
                <div key={i} className="border border-dashed border-gray-300 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={`Copy ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter }}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            {layout.count} photo{layout.count === 1 ? '' : 's'} ({layout.cols}x{layout.rows}) on {paper.label}
          </p>

          <Button onClick={handleDownload} loading={downloading} className="w-full" size="lg" variant="secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Print Sheet
          </Button>
        </>
      )}
    </div>
  )
}
