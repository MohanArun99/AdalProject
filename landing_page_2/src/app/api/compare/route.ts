import { NextResponse } from 'next/server'
import sharp from 'sharp'
import pixelmatch from 'pixelmatch'
import { saveComparison } from '@/lib/supabase'

const TARGET_WIDTH = 800

interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
}

function findBoundingBoxes(
  diff: Uint8ClampedArray,
  width: number,
  height: number,
  diffColor: [number, number, number] = [255, 0, 0],
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
      if (bw > 8 && bh > 8) {
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

    // top
    overlays.push({ input: { create: { width: w, height: bw, channels: 4, background: color } }, top: y, left: x })
    // bottom
    if (y + h - bw > y) {
      overlays.push({ input: { create: { width: w, height: bw, channels: 4, background: color } }, top: y + h - bw, left: x })
    }
    // left
    overlays.push({ input: { create: { width: bh, height: h, channels: 4, background: color } }, top: y, left: x })
    // right
    if (x + w - bh > x) {
      overlays.push({ input: { create: { width: bh, height: h, channels: 4, background: color } }, top: y, left: x + w - bh })
    }
  }

  return overlays
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data with image_a and image_b' }, { status: 400 })
    }

    const formData = await request.formData()
    const fileA = formData.get('image_a') as File | null
    const fileB = formData.get('image_b') as File | null

    if (!fileA || !fileB) {
      return NextResponse.json({ error: 'Both image_a and image_b are required' }, { status: 400 })
    }

    const [bufA, bufB] = await Promise.all([
      fileA.arrayBuffer().then((b) => Buffer.from(b)),
      fileB.arrayBuffer().then((b) => Buffer.from(b)),
    ])

    // Resize image A to target width, get dimensions
    const imgA = await sharp(bufA).resize({ width: TARGET_WIDTH }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width, height } = imgA.info

    // Resize image B to exact same dimensions
    const imgB = await sharp(bufB).resize({ width, height, fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

    // Pixelmatch
    const diff = new Uint8ClampedArray(width * height * 4)
    const numDiffPixels = pixelmatch(
      new Uint8ClampedArray(imgA.data.buffer, imgA.data.byteOffset, imgA.data.byteLength),
      new Uint8ClampedArray(imgB.data.buffer, imgB.data.byteOffset, imgB.data.byteLength),
      diff,
      width,
      height,
      { threshold: 0.1, diffColor: [255, 0, 0], alpha: 0.3 },
    )

    const totalPixels = width * height
    const similarity = Math.round((1 - numDiffPixels / totalPixels) * 10000) / 100

    // Find bounding boxes from diff clusters
    const boxes = findBoundingBoxes(diff, width, height)

    // Composite bounding boxes onto image B
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

    // Try to persist to Supabase; fall back to data URL
    const saved = await saveComparison(similarity, resultImage)

    const diff_image_url = (saved?.url && saved.url.length > 0)
      ? saved.url
      : `data:image/png;base64,${resultImage.toString('base64')}`

    return NextResponse.json({
      similarity,
      diff_image_url,
      id: saved?.id || null,
      ...(saved?.debug ? { supabase_debug: saved.debug } : {}),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Compare API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
