import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import pixelmatch from 'pixelmatch'

describe('compare engine integration', () => {
  it('returns 100% similarity for identical images', async () => {
    const width = 100, height = 100
    const img = await sharp({
      create: { width, height, channels: 4, background: { r: 100, g: 150, b: 200, alpha: 255 } },
    }).raw().toBuffer()

    const diff = new Uint8ClampedArray(width * height * 4)
    const numDiff = pixelmatch(
      new Uint8ClampedArray(img.buffer, img.byteOffset, img.byteLength),
      new Uint8ClampedArray(img.buffer, img.byteOffset, img.byteLength),
      diff, width, height, { threshold: 0.1 },
    )

    const similarity = Math.round((1 - numDiff / (width * height)) * 10000) / 100
    expect(similarity).toBe(100)
    expect(numDiff).toBe(0)
  })

  it('detects differences between two distinct images', async () => {
    const width = 100, height = 100
    const imgA = await sharp({
      create: { width, height, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 255 } },
    }).raw().toBuffer()

    const imgB = await sharp({
      create: { width, height, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 255 } },
    }).raw().toBuffer()

    const diff = new Uint8ClampedArray(width * height * 4)
    const numDiff = pixelmatch(
      new Uint8ClampedArray(imgA.buffer, imgA.byteOffset, imgA.byteLength),
      new Uint8ClampedArray(imgB.buffer, imgB.byteOffset, imgB.byteLength),
      diff, width, height, { threshold: 0.1 },
    )

    const similarity = Math.round((1 - numDiff / (width * height)) * 10000) / 100
    expect(similarity).toBeLessThan(50)
    expect(numDiff).toBeGreaterThan(0)
  })

  it('produces partial similarity for images with a changed region', async () => {
    const width = 100, height = 100
    const base = { r: 200, g: 200, b: 200, alpha: 255 }

    const bufA = await sharp({
      create: { width, height, channels: 4, background: base },
    }).raw().toBuffer()

    // Create image B with a 20x20 red patch in the center
    const bufB = Buffer.from(bufA)
    for (let y = 40; y < 60; y++) {
      for (let x = 40; x < 60; x++) {
        const i = (y * width + x) * 4
        bufB[i] = 255
        bufB[i + 1] = 0
        bufB[i + 2] = 0
      }
    }

    const diff = new Uint8ClampedArray(width * height * 4)
    const numDiff = pixelmatch(
      new Uint8ClampedArray(bufA.buffer, bufA.byteOffset, bufA.byteLength),
      new Uint8ClampedArray(bufB.buffer, bufB.byteOffset, bufB.byteLength),
      diff, width, height, { threshold: 0.1 },
    )

    const similarity = Math.round((1 - numDiff / (width * height)) * 10000) / 100
    // 20x20 patch = 400 pixels out of 10000 = 4% difference → ~96% similar
    expect(similarity).toBeGreaterThan(90)
    expect(similarity).toBeLessThan(100)
  })
})
