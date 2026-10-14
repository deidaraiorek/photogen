import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { finalizeJpegSize, padJpegToMinimumSize, prepareJpegForDownload } from '../src/lib/utils.ts'

const MIN_BYTES = 200 * 1024
const MAX_BYTES = 5 * 1024 * 1024

async function loadJpegFixture() {
  return new Uint8Array(await readFile(new URL('../public/logo.jpg', import.meta.url)))
}

test('pads a real JPEG to the requested minimum without moving its end marker', async () => {
  const jpeg = await loadJpegFixture()

  const padded = padJpegToMinimumSize(jpeg, MIN_BYTES)

  assert.equal(padded.length, MIN_BYTES)
  assert.deepEqual(padded.subarray(0, jpeg.length - 2), jpeg.subarray(0, -2))
  assert.deepEqual(Array.from(padded.subarray(-2)), [0xff, 0xd9])
})

test('leaves a JPEG unchanged when it already meets the minimum', () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9])

  assert.equal(padJpegToMinimumSize(jpeg, jpeg.length), jpeg)
})

test('rejects data without a JPEG end marker', () => {
  const invalid = Uint8Array.from([0xff, 0xd8, 0x01, 0x02])

  assert.throws(() => padJpegToMinimumSize(invalid, 10), /end-of-image marker/)
})

test('finalizes an edited JPEG inside the configured size range', () => {
  const editedJpeg = Uint8Array.from([0xff, 0xd8, 0x01, 0x02, 0xff, 0xd9])

  const finalized = finalizeJpegSize(editedJpeg, 200 * 1024, 5 * 1024 * 1024)

  assert.equal(finalized.length, 200 * 1024)
})

test('rejects an edited JPEG that still exceeds the maximum', () => {
  const oversizedJpeg = new Uint8Array(11)
  oversizedJpeg[0] = 0xff
  oversizedJpeg[1] = 0xd8
  oversizedJpeg[9] = 0xff
  oversizedJpeg[10] = 0xd9

  assert.throws(() => finalizeJpegSize(oversizedJpeg, 0, 10), /exceeds maximum/)
})

test('keeps an untouched server download within the Canadian size range', async () => {
  const source = padJpegToMinimumSize(await loadJpegFixture(), MIN_BYTES)

  const downloaded = await prepareJpegForDownload(source, MIN_BYTES, MAX_BYTES)

  assert.equal(downloaded.length, MIN_BYTES)
})

test('pads a manual-crop download after the browser replaces the source JPEG', async () => {
  const manualCrop = await loadJpegFixture()

  const downloaded = await prepareJpegForDownload(manualCrop, MIN_BYTES, MAX_BYTES)

  assert.equal(downloaded.length, MIN_BYTES)
})

test('pads the final fine-tuned JPEG returned by browser re-encoding', async () => {
  const source = padJpegToMinimumSize(await loadJpegFixture(), MIN_BYTES)
  const fineTuned = await loadJpegFixture()

  const downloaded = await prepareJpegForDownload(
    source,
    MIN_BYTES,
    MAX_BYTES,
    async () => fineTuned,
  )

  assert.equal(downloaded.length, MIN_BYTES)
})
