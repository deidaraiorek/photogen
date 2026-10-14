export function base64ToBytes(base64: string): Uint8Array {
  const payload = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function base64ToObjectUrl(base64: string, mimeType = 'image/jpeg'): string {
  const bytes = base64ToBytes(base64)
  const blob = new Blob([new Uint8Array(bytes).buffer], { type: mimeType })
  return URL.createObjectURL(blob)
}

export function padJpegToMinimumSize(bytes: Uint8Array, minSizeBytes: number): Uint8Array {
  if (bytes.length >= minSizeBytes) return bytes
  if (bytes.length < 2 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    throw new Error('JPEG is missing its end-of-image marker')
  }

  let bytesNeeded = minSizeBytes - bytes.length
  const segments: Uint8Array[] = []
  let paddingLength = 0

  while (bytesNeeded > 0) {
    const payloadSize = Math.min(65_533, Math.max(0, bytesNeeded - 4))
    const segment = new Uint8Array(payloadSize + 4)
    segment[0] = 0xff
    segment[1] = 0xfe
    segment[2] = ((payloadSize + 2) >> 8) & 0xff
    segment[3] = (payloadSize + 2) & 0xff
    segments.push(segment)
    paddingLength += segment.length
    bytesNeeded -= segment.length
  }

  const padded = new Uint8Array(bytes.length + paddingLength)
  let offset = bytes.length - 2
  padded.set(bytes.subarray(0, offset))
  for (const segment of segments) {
    padded.set(segment, offset)
    offset += segment.length
  }
  padded.set(bytes.subarray(bytes.length - 2), offset)
  return padded
}

export function finalizeJpegSize(
  bytes: Uint8Array,
  minSizeBytes: number,
  maxSizeBytes?: number,
): Uint8Array {
  const finalBytes = padJpegToMinimumSize(bytes, minSizeBytes)
  if (maxSizeBytes && finalBytes.length > maxSizeBytes) {
    throw new Error(`JPEG exceeds maximum file size of ${formatFileSize(maxSizeBytes / 1024)}.`)
  }
  return finalBytes
}

export async function prepareJpegForDownload(
  sourceBytes: Uint8Array,
  minSizeBytes: number,
  maxSizeBytes?: number,
  reencode?: () => Promise<Uint8Array>,
): Promise<Uint8Array> {
  const encodedBytes = reencode ? await reencode() : sourceBytes
  return finalizeJpegSize(encodedBytes, minSizeBytes, maxSizeBytes)
}

export function downloadBytes(bytes: Uint8Array, filename: string, mimeType = 'image/jpeg') {
  const blob = new Blob([new Uint8Array(bytes).buffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function validateImageFile(file: File): string | null {
  if (file.type && !file.type.startsWith('image/')) return 'Please upload an image file.'
  if (file.size > 15 * 1024 * 1024) return 'File size must be under 15MB.'
  return null
}
