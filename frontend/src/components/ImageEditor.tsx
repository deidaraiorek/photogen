'use client'

import type { ProcessOptions, ProcessingStatus } from '@/lib/types'
import Button from './ui/Button'

interface ImageEditorProps {
  options: ProcessOptions
  onChange: (opts: ProcessOptions) => void
  onProcess: () => void
  status: ProcessingStatus
  hasFile: boolean
  hasResult: boolean
}

export default function ImageEditor({ options, onChange, onProcess, status, hasFile, hasResult }: ImageEditorProps) {
  function set<K extends keyof ProcessOptions>(key: K, val: ProcessOptions[K]) {
    onChange({ ...options, [key]: val })
  }

  const bgColors = [
    { color: '#FFFFFF', label: 'White' },
    { color: '#E8E8E8', label: 'Gray' },
    { color: '#F0F4FF', label: 'Light Blue' },
    { color: '#D4E8FF', label: 'Blue' },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Auto enhance</span>
          <button
            type="button"
            onClick={() => set('auto_enhance', !options.auto_enhance)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${options.auto_enhance ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${options.auto_enhance ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Remove background</span>
          <button
            type="button"
            onClick={() => set('remove_background', !options.remove_background)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${options.remove_background ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${options.remove_background ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-gray-400 font-medium">Background color</span>
          <div className="flex gap-2">
            {bgColors.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                title={label}
                onClick={() => set('background_color', color)}
                className={`h-9 w-9 sm:h-7 sm:w-7 rounded-lg border-2 transition-all duration-150 ${
                  options.background_color === color
                    ? 'border-primary-500 ring-2 ring-primary-100 scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <label className="h-9 w-9 sm:h-7 sm:w-7 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors flex items-center justify-center">
              <input
                type="color"
                value={options.background_color || '#FFFFFF'}
                onChange={(e) => set('background_color', e.target.value)}
                className="opacity-0 absolute"
              />
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={onProcess}
        loading={status === 'processing'}
        disabled={!hasFile || status === 'processing'}
        className="w-full"
        size="lg"
      >
        {status === 'processing'
          ? 'Processing...'
          : hasResult
          ? 'Re-process Photo'
          : 'Create Passport Photo'}
      </Button>
    </div>
  )
}
