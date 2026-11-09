export interface PaperSize {
  id: string
  label: string
  width_mm: number
  height_mm: number
}

export const PAPER_SIZES: PaperSize[] = [
  { id: '10x15', label: '10 x 15 cm (4x6")', width_mm: 100, height_mm: 150 },
  { id: '13x18', label: '13 x 18 cm (5x7")', width_mm: 130, height_mm: 180 },
  { id: 'a4', label: 'A4', width_mm: 210, height_mm: 297 },
  { id: 'letter', label: 'US Letter', width_mm: 215.9, height_mm: 279.4 },
]

const MARGIN_MM = 2
const GUTTER_MM = 2

export interface PrintSheetLayout {
  cols: number
  rows: number
  count: number
  photoWidthMm: number
  photoHeightMm: number
  offsetXMm: number
  offsetYMm: number
  marginMm: number
  gutterMm: number
  rotated: boolean
}

function maxFit(paperLengthMm: number, photoLengthMm: number): number {
  const usable = paperLengthMm - 2 * MARGIN_MM + GUTTER_MM
  const step = photoLengthMm + GUTTER_MM
  return Math.max(0, Math.floor(usable / step))
}

export function computePrintSheetLayout(
  paper: PaperSize,
  photoWidthMm: number,
  photoHeightMm: number
): PrintSheetLayout {
  const straightCols = maxFit(paper.width_mm, photoWidthMm)
  const straightRows = maxFit(paper.height_mm, photoHeightMm)
  const rotatedCols = maxFit(paper.width_mm, photoHeightMm)
  const rotatedRows = maxFit(paper.height_mm, photoWidthMm)

  const straightCount = straightCols * straightRows
  const rotatedCount = rotatedCols * rotatedRows

  const rotated = rotatedCount > straightCount
  const cols = rotated ? rotatedCols : straightCols
  const rows = rotated ? rotatedRows : straightRows
  const pw = rotated ? photoHeightMm : photoWidthMm
  const ph = rotated ? photoWidthMm : photoHeightMm

  const gridWidthMm = cols > 0 ? cols * pw + (cols - 1) * GUTTER_MM : 0
  const gridHeightMm = rows > 0 ? rows * ph + (rows - 1) * GUTTER_MM : 0

  return {
    cols,
    rows,
    count: cols * rows,
    photoWidthMm: pw,
    photoHeightMm: ph,
    offsetXMm: (paper.width_mm - gridWidthMm) / 2,
    offsetYMm: (paper.height_mm - gridHeightMm) / 2,
    marginMm: MARGIN_MM,
    gutterMm: GUTTER_MM,
    rotated,
  }
}

export async function renderPrintSheet(
  imageSrc: string,
  paper: PaperSize,
  layout: PrintSheetLayout,
  dpi: number
): Promise<string> {
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = imageSrc
  })

  const pxPerMm = dpi / 25.4
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(paper.width_mm * pxPerMm)
  canvas.height = Math.round(paper.height_mm * pxPerMm)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const photoWpx = layout.photoWidthMm * pxPerMm
  const photoHpx = layout.photoHeightMm * pxPerMm
  const gutterPx = layout.gutterMm * pxPerMm
  const offsetXpx = layout.offsetXMm * pxPerMm
  const offsetYpx = layout.offsetYMm * pxPerMm

  ctx.strokeStyle = '#B0B0B0'
  ctx.lineWidth = Math.max(1, pxPerMm * 0.15)
  ctx.setLineDash([pxPerMm * 1.5, pxPerMm * 1.5])

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x = offsetXpx + col * (photoWpx + gutterPx)
      const y = offsetYpx + row * (photoHpx + gutterPx)
      if (layout.rotated) {
        ctx.save()
        ctx.translate(x + photoWpx / 2, y + photoHpx / 2)
        ctx.rotate(Math.PI / 2)
        ctx.drawImage(img, -photoHpx / 2, -photoWpx / 2, photoHpx, photoWpx)
        ctx.restore()
      } else {
        ctx.drawImage(img, x, y, photoWpx, photoHpx)
      }
      ctx.strokeRect(x, y, photoWpx, photoHpx)
    }
  }

  return canvas.toDataURL('image/jpeg', 0.95)
}
