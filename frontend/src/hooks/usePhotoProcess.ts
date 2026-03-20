'use client'

import { useCallback, useState } from 'react'
import { processPhoto } from '@/lib/api'
import type { ProcessOptions, ProcessResult, ProcessingStatus } from '@/lib/types'

export function usePhotoProcess() {
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const process = useCallback(
    async (file: File, documentType: string, options: Partial<ProcessOptions> = {}) => {
      setStatus('processing')
      setError(null)
      try {
        const res = await processPhoto(file, documentType, options)
        setResult(res)
        setStatus('done')
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail ||
          (e as { message?: string })?.message ||
          'Processing failed. Please try again.'
        setError(msg)
        setStatus('error')
      }
    },
    []
  )

  const reset = useCallback(() => {
    setResult(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { result, setResult, status, error, process, reset }
}
