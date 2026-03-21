'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  step?: number
}

export default function Card({ children, className = '', title, step }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-gray-100 px-3 sm:px-5 py-3 sm:py-3.5 flex items-center gap-2.5">
          {step !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
              {step}
            </span>
          )}
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
      )}
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  )
}
