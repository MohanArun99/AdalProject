import { NextResponse } from 'next/server'
import sharp from 'sharp'
import pixelmatch from 'pixelmatch'
import { saveComparison } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { isImageByMagic, validateFileSize, validateDimensions, parseThreshold, parseBool, parseMinBoxSize } from '@/lib/validate'
import { type BoundingBox, ENGINE_DEFAULTS } from '@/lib/types'

export const runtime = 'nodejs'

sharp.concurrency(2)

function findBoundingBoxes(
  diff: Uint8ClampedArray,
  width: number,
  height: number,
  diffColor: [number, number, number] = [255, 0, 0],
  minBoxSize: number = ENGINE_DEFAULTS.MIN_BOX_SIZE,
): BoundingBox[] {
  const visited = new Uint8Array(width * height)
  const boxes: BoundingBox[] = []

  const isDiffPixel = (x: number, y: number) => {
    const i = (y * width + x) * 4
    return diff[i] === diffColor[0] && diff[i + 1] === diffColor[1] && diff[i + 2] === diffColor[2]
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (visited[idx] || !isDiffPixel(x, y)) continue

      let minX = x, maxX = x, minY = y, maxY = y
      const stack = [{ x, y }]
      visited[idx] = 1

      while (stack.length > 0) {
        const p = stack.pop()!
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = p.x + dx, ny = p.y + dy
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
            const ni = ny * width + nx
            if (visited[ni]) continue
            if (!isDiffPixel(nx, ny)) continue
            visited[ni] = 1
            stack.push({ x: nx, y: ny })
            minX = Math.min(minX, nx)
            maxX = Math.max(maxX, nx)
            minY = Math.min(minY, ny)
            maxY = Math.max(maxY, ny)
          }
        }
      }

      const bw = maxX - minX + 1
      const bh = maxY - minY + 1
      if (bw > minBoxSize && bh > minBoxSize) {
        boxes.push({ x: minX, y: minY, w: bw, h: bh })
      }
    }
  }

  return boxes
}

function buildBoxOverlays(boxes: BoundingBox[], imgWidth: number, imgHeight: number, borderWidth = 2) {
  const overlays: sharp.OverlayOptions[] = []
  const color = { r: 255, g: 0, b: 0, alpha: 255 }
  const pad = 4

  for (const box of boxes) {
    const x = Math.max(0, box.x - pad)
    const y = Math.max(0, box.y - pad)
    const w = Math.min(box.w + pad * 2, imgWidth - x)
    const h = Math.min(box.h + pad * 2, imgHeight - y)

    if (w < 1 || h < 1) continue

    const bw = Math.min(borderWidth, h)
    const bh = Math.min(borderWidth, w)

    overlays.push({ input: { create: { width: w, height: bw, channels: 4, background: color } }, top: y, left: x })
    if (y + h - bw > y) {
      overlays.push({ input: { create: { width: w, height: bw, channels: 4, background: color } }, top: y + h - bw, left: x })
    }
    overlays.push({ input: { create: { width: bh, height: h, channels: 4, background: color } }, top: y, left: x })
    if (x + w - bh > x) {
      overlays.push({ input: { create: { width: bh, height: h, channels: 4, background: color } }, top: y, left: x + w - bh })
    }
  }

  return overlays
}

function errorJson(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
    const rl = rateLimit(ip)
    if (!rl.ok) {
      const retryIn = Math.ceil(rl.retryAfterMs / 1000)
      return errorJson(
        `Rate limit exceeded. Try again in ${retryIn}s.`,
        'RATE_LIMITED',
        429,
      )
    }

    // --- Content-type check ---
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return errorJson('Expected multipart/form-data with image_a and image_b', 'INVALID_CONTENT_TYPE', 400)
    }

    const formData = await request.formData()
    const fileA = formData.get('image_a') as File | null
    const fileB = formData.get('image_b') as File | null

    if (!fileA || !fileB) {
      return errorJson('Both image_a and image_b are required', 'MISSING_FILES', 400)
    }

    // --- Parse optional tuning params ---
    const threshold = parseThreshold(formData.get('threshold'))
    const includeAA = parseBool(formData.get('includeAA'), ENGINE_DEFAULTS.INCLUDE_AA)
    const minBoxSize = parseMinBoxSize(formData.get('minBoxSize'))

    const [bufA, bufB] = await Promise.all([
      fileA.arrayBuffer().then((b) => Buffer.from(b)),
      fileB.arrayBuffer().then((b) => Buffer.from(b)),
    ])

    // --- File size validation ---
    const sizeErrA = validateFileSize(bufA)
    if (sizeErrA) return errorJson(`image_a: ${sizeErrA}`, 'FILE_TOO_LARGE', 400)
    const sizeErrB = validateFileSize(bufB)
    if (sizeErrB) return errorJson(`image_b: ${sizeErrB}`, 'FILE_TOO_LARGE', 400)

    // --- Magic-number validation ---
    if (!isImageByMagic(bufA)) return errorJson('image_a is not a valid image file', 'INVALID_IMAGE', 400)
    if (!isImageByMagic(bufB)) return errorJson('image_b is not a valid image file', 'INVALID_IMAGE', 400)

    // --- Dimension validation (pre-resize) ---
    const metaA = await sharp(bufA).metadata()
    const metaB = await sharp(bufB).metadata()
    if (metaA.width && metaA.height) {
      const dimErr = validateDimensions(metaA.width, metaA.height)
      if (dimErr) return errorJson(`image_a: ${dimErr}`, 'DIMENSIONS_EXCEEDED', 400)
    }
    if (metaB.width && metaB.height) {
      const dimErr = validateDimensions(metaB.width, metaB.height)
      if (dimErr) return errorJson(`image_b: ${dimErr}`, 'DIMENSIONS_EXCEEDED', 400)
    }

    // --- Resize & normalize ---
    const imgA = await sharp(bufA)
      .resize({ width: ENGINE_DEFAULTS.TARGET_WIDTH })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { width, height } = imgA.info

    const imgB = await sharp(bufB)
      .resize({ width, height, fit: 'fill' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // --- Pixelmatch ---
    const diff = new Uint8ClampedArray(width * height * 4)
    const numDiffPixels = pixelmatch(
      new Uint8ClampedArray(imgA.data.buffer, imgA.data.byteOffset, imgA.data.byteLength),
      new Uint8ClampedArray(imgB.data.buffer, imgB.data.byteOffset, imgB.data.byteLength),
      diff,
      width,
      height,
      { threshold, includeAA, diffColor: [255, 0, 0], alpha: 0.3 },
    )

    const totalPixels = width * height
    const similarity = Math.round((1 - numDiffPixels / totalPixels) * 10000) / 100

    // --- Bounding boxes ---
    const boxes = findBoundingBoxes(diff, width, height, [255, 0, 0], minBoxSize)

    // --- Composite overlay ---
    const overlays = buildBoxOverlays(boxes, width, height)
    let resultImage: Buffer

    if (overlays.length > 0) {
      resultImage = await sharp(imgB.data, { raw: { width, height, channels: 4 } })
        .composite(overlays)
        .png()
        .toBuffer()
    } else {
      resultImage = await sharp(imgB.data, { raw: { width, height, channels: 4 } })
        .png()
        .toBuffer()
    }

    // --- Persist ---
    const saved = await saveComparison(similarity, resultImage)

    const diff_image_url = (saved?.url && saved.url.length > 0)
      ? saved.url
      : `data:image/png;base64,${resultImage.toString('base64')}`

    return NextResponse.json({
      similarity,
      diff_image_url,
      id: saved?.id || null,
      boxes,
      dimensions: { width, height },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Compare API error:', message)
    return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
