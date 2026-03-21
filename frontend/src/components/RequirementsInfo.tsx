'use client'

import type { PhotoSpec } from '@/lib/types'

interface RequirementsInfoProps {
  spec: PhotoSpec
}

export default function RequirementsInfo({ spec }: RequirementsInfoProps) {
  const { dimensions, background, file_requirements, rules } = spec

  return (
    <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3.5 space-y-2.5 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Dimensions</p>
          <p className="text-gray-700 font-medium">
            {dimensions.width_mm} x {dimensions.height_mm} mm
          </p>
          <p className="text-gray-400">{dimensions.width_px} x {dimensions.height_px} px</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Background</p>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded border border-gray-200"
              style={{ backgroundColor: background.color }}
            />
            <span className="text-gray-700 font-medium">{background.name}</span>
          </div>
          <p className="text-gray-400">Max {file_requirements.max_size_kb} KB</p>
        </div>
      </div>

      {rules.length > 0 && (
        <ul className="space-y-0.5 pt-1 border-t border-blue-100">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500">
              <span className="text-primary-500 mt-px shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {rule}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
