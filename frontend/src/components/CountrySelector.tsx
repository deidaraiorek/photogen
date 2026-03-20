'use client'

import { COUNTRY_LABELS } from '@/constants/photoRequirements'
import type { PhotoSpec } from '@/lib/types'
import Select from './ui/Select'

interface CountrySelectorProps {
  value: string
  onChange: (code: string) => void
  specs: Record<string, PhotoSpec>
}

export default function CountrySelector({ value, onChange, specs }: CountrySelectorProps) {
  const options = Object.keys(specs).map((code) => ({
    value: code,
    label: COUNTRY_LABELS[code] || specs[code].name,
  }))

  return (
    <Select
      label="Document type"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
    />
  )
}
