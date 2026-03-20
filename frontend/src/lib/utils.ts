export function base64ToObjectUrl(base64: string, mimeType = 'image/jpeg'): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

export function downloadBase64(base64: string, filename: string, mimeType = 'image/jpeg') {
  const url = base64ToObjectUrl(base64, mimeType)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function validateImageFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'Please upload a JPEG, PNG, or WebP image.'
  if (file.size > 15 * 1024 * 1024) return 'File size must be under 15MB.'
  return null
}
