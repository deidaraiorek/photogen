'use client'

import { useEffect, useMemo, useState } from 'react'
import { getRequirements } from '@/lib/api'
import { DEFAULT_DOCUMENT } from '@/constants/photoRequirements'
import type { ProcessOptions, PhotoSpec } from '@/lib/types'
import { base64ToObjectUrl } from '@/lib/utils'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePhotoProcess } from '@/hooks/usePhotoProcess'
import BeforeAfter from '@/components/BeforeAfter'
import CountrySelector from '@/components/CountrySelector'
import DownloadButton from '@/components/DownloadButton'
import ImageEditor from '@/components/ImageEditor'
import PhotoUploader from '@/components/PhotoUploader'
import RequirementsInfo from '@/components/RequirementsInfo'
import ManualCropModal from '@/components/ManualCropModal'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

export default function Home() {
  const [specs, setSpecs] = useState<Record<string, PhotoSpec>>({})
  const [specsLoading, setSpecsLoading] = useState(true)
  const [documentType, setDocumentType] = useState(DEFAULT_DOCUMENT)
  const [options, setOptions] = useState<ProcessOptions>({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    remove_background: true,
    background_color: undefined,
    auto_enhance: true,
  })

  const [postBrightness, setPostBrightness] = useState(100)
  const [postContrast, setPostContrast] = useState(100)
  const [postSaturation, setPostSaturation] = useState(100)
  const [showManualCrop, setShowManualCrop] = useState(false)

  const { file, previewUrl, error: uploadError, load, clear } = useImageUpload()
  const { result, setResult, status, error: processError, process, reset } = usePhotoProcess()

  useEffect(() => {
    getRequirements()
      .then((data) => setSpecs(data.countries))
      .catch(() => {})
      .finally(() => setSpecsLoading(false))
  }, [])

  useEffect(() => {
    if (specs[documentType]) {
      setOptions((prev) => ({
        ...prev,
        background_color: specs[documentType].background.color,
      }))
    }
  }, [documentType, specs])

  function handleProcess() {
    if (file && documentType) process(file, documentType, options)
  }

  function handleClear() {
    clear()
    reset()
    setPostBrightness(100)
    setPostContrast(100)
    setPostSaturation(100)
    setShowManualCrop(false)
  }

  function handleManualCrop() {
    if (!selectedSpec || !result) return
    setShowManualCrop(true)
  }

  function handleManualCropApply(croppedBase64: string) {
    if (!result) return
    setResult({
      ...result,
      processed_image: croppedBase64,
      metadata: {
        ...result.metadata,
        warnings: result.metadata.warnings.filter(w => !w.includes('face')),
      },
    })
    setShowManualCrop(false)
  }

  const processedUrl = result ? base64ToObjectUrl(result.processed_image) : null
  const bgRemovedUrl = useMemo(() => result?.bg_removed_image ? base64ToObjectUrl(result.bg_removed_image) : null, [result?.bg_removed_image])
  const postFilter = `brightness(${postBrightness}%) contrast(${postContrast}%) saturate(${postSaturation}%)`
  const selectedSpec = specs[documentType]
  const hasResult = status === 'done' && result

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden">
              <img src="/logo-cropped.png" alt="PhotoGen" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">PhotoGen</h1>
              <p className="text-[11px] text-gray-400">Free Passport Photo Maker</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[11px] font-medium text-green-700">Free & Unlimited</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your Passport Photo</h2>
          <p className="mt-1.5 text-gray-400 text-xs sm:text-sm">AI-powered background removal, face detection, and auto-cropping</p>
        </div>

        {specsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column: controls */}
            <div className="space-y-4 lg:col-span-1">
              <Card title="Upload Photo" step={1}>
                <PhotoUploader
                  onFileSelect={load}
                  previewUrl={previewUrl}
                  error={uploadError}
                  onClear={handleClear}
                />
              </Card>

              <Card title="Document Type" step={2}>
                <div className="space-y-3">
                  <CountrySelector value={documentType} onChange={setDocumentType} specs={specs} />
                  {selectedSpec && <RequirementsInfo spec={selectedSpec} />}
                </div>
              </Card>

              <Card title="Settings" step={3}>
                <ImageEditor
                  options={options}
                  onChange={setOptions}
                  onProcess={handleProcess}
                  status={status}
                  hasFile={!!file}
                  hasResult={!!result}
                />
                {processError && (
                  <p className="mt-3 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 p-2.5">
                    {processError}
                  </p>
                )}
              </Card>
            </div>

            {/* Right column: results */}
            <div className="lg:col-span-2 space-y-4">
              {status === 'idle' && !result && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-48 sm:min-h-96">
                  <svg className="h-12 w-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-gray-400 text-base">Your result will appear here</h3>
                  <p className="text-gray-300 mt-1 text-sm">Upload a photo and click &quot;Create Passport Photo&quot;</p>
                </div>
              )}

              {status === 'processing' && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-12 flex flex-col items-center justify-center min-h-48 sm:min-h-96 space-y-4 animate-fade-in">
                  <Spinner size="lg" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">Processing your photo...</p>
                    <p className="text-sm text-gray-400 mt-1">This usually takes 1 minute</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-xs text-gray-300">
                    {['Detecting face', 'Removing background', 'Auto-cropping to spec', 'Enhancing quality'].map((step) => (
                      <span key={step}>{step}</span>
                    ))}
                  </div>
                </div>
              )}

              {hasResult && processedUrl && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid gap-4 lg:grid-cols-5">
                    {/* Before / After comparison */}
                    <Card title="Before / After" className="lg:col-span-3">
                      <BeforeAfter before={previewUrl} after={processedUrl} afterStyle={{ filter: postFilter }} />
                      <button
                        type="button"
                        onClick={handleManualCrop}
                        className="mt-3 w-full py-2.5 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-xs text-gray-500 active:bg-white transition-colors"
                      >
                        AI crop not right? <span className="font-medium text-primary-600">Manual crop</span>
                      </button>
                    </Card>

                    {/* Fine-tune + Download */}
                    <div className="space-y-4 lg:col-span-2">
                      <Card title="Fine-tune">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-gray-500">Brightness</span>
                              <span className="text-gray-400 tabular-nums">{postBrightness}%</span>
                            </div>
                            <input type="range" min={50} max={150} value={postBrightness} onChange={(e) => setPostBrightness(Number(e.target.value))} className="w-full" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-gray-500">Contrast</span>
                              <span className="text-gray-400 tabular-nums">{postContrast}%</span>
                            </div>
                            <input type="range" min={50} max={150} value={postContrast} onChange={(e) => setPostContrast(Number(e.target.value))} className="w-full" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-gray-500">Saturation</span>
                              <span className="text-gray-400 tabular-nums">{postSaturation}%</span>
                            </div>
                            <input type="range" min={50} max={150} value={postSaturation} onChange={(e) => setPostSaturation(Number(e.target.value))} className="w-full" />
                          </div>
                          <button
                            type="button"
                            onClick={() => { setPostBrightness(100); setPostContrast(100); setPostSaturation(100) }}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Reset to default
                          </button>
                        </div>
                      </Card>

                      <Card title="Download">
                        <DownloadButton base64={result.processed_image} metadata={result.metadata} filter={postFilter} />
                      </Card>
                    </div>
                  </div>

                  {/* Print sheet */}
                  <Card title="Print Sheet Preview">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded overflow-hidden border border-gray-200 bg-white" style={{ aspectRatio: '3 / 4' }}>
                          <img src={processedUrl} alt={`Copy ${i + 1}`} className="w-full h-full object-contain" style={{ filter: postFilter }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-300 mt-2 text-center">Print at your nearest photo center</p>
                  </Card>
                </div>
              )}

              {status === 'error' && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 flex flex-col items-center text-center min-h-50 justify-center animate-fade-in">
                  <span className="text-3xl mb-3">⚠️</span>
                  <h3 className="font-semibold text-red-800">Processing failed</h3>
                  <p className="text-sm text-red-600 mt-1">{processError}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>PhotoGen — Free passport photo maker powered by open-source AI</p>
          <p>No data stored · No account required · 100% free</p>
        </div>
      </footer>

      {showManualCrop && bgRemovedUrl && selectedSpec && (
        <ManualCropModal
          imageSrc={bgRemovedUrl}
          spec={selectedSpec}
          bgColor={options.background_color || selectedSpec.background.color}
          onApply={handleManualCropApply}
          onClose={() => setShowManualCrop(false)}
        />
      )}
    </div>
  )
}
