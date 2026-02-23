import { LIMITS, ENGINE_DEFAULTS } from './types'

const IMAGE_SIGNATURES: [number[], string][] = [
  [[0x89, 0x50, 0x4e, 0x47], 'image/png'],
  [[0xff, 0xd8, 0xff], 'image/jpeg'],
  [[0x47, 0x49, 0x46], 'image/gif'],
  [[0x52, 0x49, 0x46, 0x46], 'image/webp'], // RIFF header (WebP)
  [[0x42, 0x4d], 'image/bmp'],
]

export function isImageByMagic(buffer: Buffer): boolean {
  if (buffer.length < 4) return false
  return IMAGE_SIGNATURES.some(([sig]) =>
    sig.every((byte, i) => buffer[i] === byte)
  )
}

export function validateFileSize(buffer: Buffer): string | null {
  if (buffer.length > LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(1)
    return `File too large (${sizeMB} MB). Maximum is ${LIMITS.MAX_FILE_SIZE / 1024 / 1024} MB.`
  }
  return null
}

export function validateDimensions(width: number, height: number): string | null {
  if (width > LIMITS.MAX_DIMENSION || height > LIMITS.MAX_DIMENSION) {
    return `Image dimensions ${width}x${height} exceed maximum ${LIMITS.MAX_DIMENSION}x${LIMITS.MAX_DIMENSION}.`
  }
  return null
}

export function parseThreshold(raw: FormDataEntryValue | null): number {
  if (!raw) return ENGINE_DEFAULTS.THRESHOLD
  const n = Number(raw)
  if (isNaN(n) || n < 0 || n > 1) return ENGINE_DEFAULTS.THRESHOLD
  return n
}

export function parseBool(raw: FormDataEntryValue | null, fallback: boolean): boolean {
  if (raw === null || raw === undefined) return fallback
  const s = String(raw).toLowerCase()
  if (s === 'true' || s === '1') return true
  if (s === 'false' || s === '0') return false
  return fallback
}

export function parseMinBoxSize(raw: FormDataEntryValue | null): number {
  if (!raw) return ENGINE_DEFAULTS.MIN_BOX_SIZE
  const n = Number(raw)
  if (isNaN(n) || n < 1 || n > 200) return ENGINE_DEFAULTS.MIN_BOX_SIZE
  return Math.round(n)
}
