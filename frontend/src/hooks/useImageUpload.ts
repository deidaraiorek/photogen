'use client'

import { useCallback, useState } from 'react'
import { validateImageFile } from '@/lib/utils'

function isHeic(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const ext = file.name.toLowerCase().split('.').pop() || ''
  return ext === 'heic' || ext === 'heif'
}

function setPreview(url: string, setter: React.Dispatch<React.SetStateAction<string | null>>) {
  setter((prev) => {
    if (prev) URL.revokeObjectURL(prev)
    return url
  })
}

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

    if (isHeic(incoming)) {
      import('heic2any').then(({ default: heic2any }) => heic2any({ blob: incoming, toType: 'image/jpeg', quality: 0.8 }))
        .then((result) => {
          const blob = Array.isArray(result) ? result[0] : result
          setPreview(URL.createObjectURL(blob), setPreviewUrl)
        })
        .catch(() => {
          setPreview(URL.createObjectURL(incoming), setPreviewUrl)
        })
    } else {
      setPreview(URL.createObjectURL(incoming), setPreviewUrl)
    }
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
