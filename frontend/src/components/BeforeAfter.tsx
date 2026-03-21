'use client'

import { MouseEvent, TouchEvent, useCallback, useRef, useState } from 'react'

interface BeforeAfterProps {
  before: string
  after: string
  afterStyle?: React.CSSProperties
}

export default function BeforeAfter({ before, after, afterStyle }: BeforeAfterProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPosition(pct)
  }, [])

  function onMouseDown() { dragging.current = true }
  function onMouseUp() { dragging.current = false }
  function onMouseMove(e: MouseEvent) { if (dragging.current) updatePosition(e.clientX) }
  function onTouchMove(e: TouchEvent) { updatePosition(e.touches[0].clientX) }

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden select-none cursor-col-resize border border-gray-200"
      style={{ aspectRatio: '3 / 4' }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      <img src={after} alt="Processed" className="absolute inset-0 w-full h-full object-contain" draggable={false} style={afterStyle} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={before} alt="Original" className="absolute inset-0 w-full h-full object-cover" draggable={false} style={{ minWidth: `${(100 / position) * 100}%`, right: 'auto' }} />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
          </svg>
        </div>
      </div>
      <div className="absolute top-2.5 left-2.5 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm">Before</div>
      <div className="absolute top-2.5 right-2.5 rounded bg-primary-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">After</div>
    </div>
  )
}
