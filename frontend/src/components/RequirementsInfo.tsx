'use client'

import type { PhotoSpec } from '@/lib/types'

interface RequirementsInfoProps {
  spec: PhotoSpec
}

export default function RequirementsInfo({ spec }: RequirementsInfoProps) {
  const { dimensions, background, file_requirements, rules } = spec

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3 text-sm">
      <h4 className="font-semibold text-blue-900">{spec.name} Requirements</h4>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <p className="text-gray-500 uppercase tracking-wide font-medium">Size</p>
          <p className="text-gray-800">
            {dimensions.width_mm} × {dimensions.height_mm} mm
          </p>
          <p className="text-gray-500">{dimensions.width_px} × {dimensions.height_px} px</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500 uppercase tracking-wide font-medium">Background</p>
          <div className="flex items-center gap-1.5">
            <div
              className="h-4 w-4 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: background.color }}
            />
            <span className="text-gray-800">{background.name}</span>
          </div>
          <p className="text-gray-500">Max {file_requirements.max_size_kb} KB</p>
        </div>
      </div>

      <ul className="space-y-1">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  )
}
