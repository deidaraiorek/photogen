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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl overflow-hidden">
              <img src="/logo.jpeg" alt="PhotoGen" className="h-full w-full object-cover scale-[1.4]" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">PhotoGen</h1>
              <p className="text-xs text-gray-500">Free Passport Photo Maker</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">Free & Unlimited</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Passport Photo Maker</h2>
          <p className="mt-2 text-gray-500">AI-powered background removal, face detection, and auto-cropping</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {['✓ AI Background Removal', '✓ Auto Crop & Resize', '✓ 10+ Countries', '✓ Instant Download'].map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>

        {specsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className={`grid gap-6 ${status === 'done' && result ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            <div className="space-y-5 lg:col-span-1">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-gray-900">1. Upload your photo</h3>
                <PhotoUploader
                  onFileSelect={load}
                  previewUrl={previewUrl}
                  error={uploadError}
                  onClear={handleClear}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900">2. Choose document type</h3>
                <CountrySelector value={documentType} onChange={setDocumentType} specs={specs} />
                {selectedSpec && <RequirementsInfo spec={selectedSpec} />}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">3. Adjust & process</h3>
                <ImageEditor
                  options={options}
                  onChange={setOptions}
                  onProcess={handleProcess}
                  status={status}
                  hasFile={!!file}
                  hasResult={!!result}
                />
                {processError && (
                  <p className="mt-3 text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 p-3">
                    {processError}
                  </p>
                )}
              </div>

            </div>

            <div className={`${status === 'done' && result ? 'lg:col-span-2' : 'lg:col-span-2'} space-y-5`}>
              {status === 'idle' && !result && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="rounded-full bg-gray-100 p-5 mb-4">
                    <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-700 text-lg">Your processed photo will appear here</h3>
                  <p className="text-gray-400 mt-1 text-sm">Upload a photo and click &quot;Create Passport Photo&quot; to get started</p>
                </div>
              )}

              {status === 'processing' && (
                <div className="rounded-xl border border-gray-200 bg-white p-12 flex flex-col items-center justify-center min-h-[400px] space-y-4">
                  <Spinner size="lg" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Processing your photo…</p>
                    <p className="text-sm text-gray-500 mt-1">AI background removal takes 5-15 seconds</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
                    <span>✦ Detecting face</span>
                    <span>✦ Removing background</span>
                    <span>✦ Auto-cropping to spec</span>
                    <span>✦ Enhancing quality</span>
                  </div>
                </div>
              )}

              {status === 'done' && result && processedUrl && previewUrl && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Before / After</h3>
                    <BeforeAfter before={previewUrl} after={processedUrl} afterStyle={{ filter: postFilter }} />
                    <button
                      type="button"
                      onClick={handleManualCrop}
                      className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      AI cropping not right? <span className="font-medium text-blue-600">Try manual crop</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Download</h3>
                    <DownloadButton base64={result.processed_image} metadata={result.metadata} filter={postFilter} />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3">Print sheet preview</h3>
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded overflow-hidden border border-gray-200" style={{ aspectRatio: '3 / 4' }}>
                          <img src={processedUrl} alt={`Copy ${i + 1}`} className="w-full h-full object-contain" style={{ filter: postFilter }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Print at your nearest photo center</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 flex flex-col items-center text-center min-h-[200px] justify-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="font-semibold text-red-900">Processing failed</h3>
                  <p className="text-sm text-red-700 mt-1">{processError}</p>
                </div>
              )}
            </div>

            {status === 'done' && result && (
              <div className="lg:col-span-1 space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="font-semibold text-gray-900">Fine-tune</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Brightness</span>
                        <span>{postBrightness}%</span>
                      </div>
                      <input type="range" min={50} max={150} value={postBrightness} onChange={(e) => setPostBrightness(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Contrast</span>
                        <span>{postContrast}%</span>
                      </div>
                      <input type="range" min={50} max={150} value={postContrast} onChange={(e) => setPostContrast(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Saturation</span>
                        <span>{postSaturation}%</span>
                      </div>
                      <input type="range" min={50} max={150} value={postSaturation} onChange={(e) => setPostSaturation(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPostBrightness(100); setPostContrast(100); setPostSaturation(100) }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Reset to default
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
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
