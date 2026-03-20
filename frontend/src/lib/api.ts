import axios from 'axios'
import type { FaceDetectResult, PhotoRequirements, PhotoSpec, ProcessOptions, ProcessResult } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: BASE_URL })

export async function getRequirements(): Promise<PhotoRequirements> {
  const res = await client.get('/api/requirements')
  return res.data
}

export async function getCountrySpec(code: string): Promise<PhotoSpec> {
  const res = await client.get(`/api/requirements/${code}`)
  return res.data
}

export async function processPhoto(
  file: File,
  documentType: string,
  options: Partial<ProcessOptions> = {}
): Promise<ProcessResult> {
  const defaults: ProcessOptions = {
    brightness: 50,
    contrast: 50,
    saturation: 50,
    remove_background: true,
    auto_enhance: true,
  }
  const merged = { ...defaults, ...options }

  const form = new FormData()
  form.append('file', file)
  form.append('document_type', documentType)
  form.append('options', JSON.stringify(merged))

  const res = await client.post('/api/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function detectFaces(file: File): Promise<FaceDetectResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post('/api/detect-face', form)
  return res.data
}

export async function removeBackground(file: File, bgColor = '#FFFFFF'): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('background_color', bgColor)
  const res = await client.post('/api/remove-background', form)
  return res.data.processed_image
}
