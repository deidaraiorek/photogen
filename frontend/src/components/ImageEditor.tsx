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
          <span className="text-sm text-gray-700">Auto enhance</span>
          <button
            type="button"
            onClick={() => set('auto_enhance', !options.auto_enhance)}
            className={`relative h-5 w-9 rounded-full transition-colors ${options.auto_enhance ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${options.auto_enhance ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Remove background</span>
          <button
            type="button"
            onClick={() => set('remove_background', !options.remove_background)}
            className={`relative h-5 w-9 rounded-full transition-colors ${options.remove_background ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${options.remove_background ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-sm text-gray-700">Background color</span>
          <div className="flex gap-2">
            {bgColors.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                title={label}
                onClick={() => set('background_color', color)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  options.background_color === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <label className="h-7 w-7 rounded-full border-2 border-gray-300 overflow-hidden cursor-pointer">
              <input
                type="color"
                value={options.background_color || '#FFFFFF'}
                onChange={(e) => set('background_color', e.target.value)}
                className="opacity-0 absolute"
              />
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">+</div>
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
          ? 'Processing…'
          : hasResult
          ? 'Re-process Photo'
          : 'Create Passport Photo'}
      </Button>
    </div>
  )
}
