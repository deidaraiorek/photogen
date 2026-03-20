'use client'

import { useCallback, useState } from 'react'
import { validateImageFile } from '@/lib/utils'

export function useImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((incoming: File) => {
    const err = validateImageFile(incoming)
    if (err) {
      setError(err)
      return false
    }
    setError(null)
    setFile(incoming)
    const url = URL.createObjectURL(incoming)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    return true
  }, [])

  const clear = useCallback(() => {
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setError(null)
  }, [])

  return { file, previewUrl, error, load, clear }
}
