export interface PhotoDimensions {
  width_px: number
  height_px: number
  width_mm: number
  height_mm: number
  dpi: number
}

export interface PhotoBackground {
  color: string
  name: string
}

export interface FaceRequirements {
  head_height_percent: number
  eye_level_percent: number
  min_head_height_mm: number
  max_head_height_mm: number
}

export interface FileRequirements {
  max_size_kb: number
  formats: string[]
  color_mode: string
}

export interface PhotoSpec {
  name: string
  country: string
  dimensions: PhotoDimensions
  background: PhotoBackground
  face_requirements: FaceRequirements
  file_requirements: FileRequirements
  rules: string[]
}

export interface PhotoRequirements {
  countries: Record<string, PhotoSpec>
}

export interface ProcessOptions {
  brightness: number
  contrast: number
  saturation: number
  remove_background: boolean
  background_color?: string
  auto_enhance: boolean
}

export interface ProcessMetadata {
  detected_faces: number
  face_confidence: number
  dimensions: { width: number; height: number }
  file_size_kb: number
  compliant: boolean
  warnings: string[]
  document_type: string
  country: string
  document_name: string
}

export interface ProcessResult {
  success: boolean
  processed_image: string
  bg_removed_image: string | null
  metadata: ProcessMetadata
  processing_time_ms: number
}

export interface FaceLocation {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export interface FaceDetectResult {
  success: boolean
  faces_detected: number
  face_locations: FaceLocation[]
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'
