import { describe, it, expect } from 'vitest'

// Re-implement findBoundingBoxes here for unit testing (extracted from route handler)
interface BoundingBox { x: number; y: number; w: number; h: number }

function findBoundingBoxes(
  diff: Uint8ClampedArray,
  width: number,
  height: number,
  diffColor: [number, number, number] = [255, 0, 0],
  minBoxSize = 8,
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

function createDiffBuffer(width: number, height: number, regions: { x: number; y: number; w: number; h: number }[]) {
  const buf = new Uint8ClampedArray(width * height * 4)
  for (const r of regions) {
    for (let ry = r.y; ry < r.y + r.h; ry++) {
      for (let rx = r.x; rx < r.x + r.w; rx++) {
        const i = (ry * width + rx) * 4
        buf[i] = 255     // R
        buf[i + 1] = 0   // G
        buf[i + 2] = 0   // B
        buf[i + 3] = 255 // A
      }
    }
  }
  return buf
}

describe('findBoundingBoxes', () => {
  it('returns empty array for identical images (no diff pixels)', () => {
    const width = 100, height = 100
    const diff = new Uint8ClampedArray(width * height * 4)
    expect(findBoundingBoxes(diff, width, height)).toEqual([])
  })

  it('detects a single large diff region', () => {
    const width = 100, height = 100
    const diff = createDiffBuffer(width, height, [{ x: 10, y: 10, w: 30, h: 30 }])
    const boxes = findBoundingBoxes(diff, width, height)
    expect(boxes.length).toBe(1)
    expect(boxes[0]).toEqual({ x: 10, y: 10, w: 30, h: 30 })
  })

  it('detects two separate diff regions', () => {
    const width = 200, height = 100
    const diff = createDiffBuffer(width, height, [
      { x: 10, y: 10, w: 20, h: 20 },
      { x: 150, y: 50, w: 20, h: 20 },
    ])
    const boxes = findBoundingBoxes(diff, width, height)
    expect(boxes.length).toBe(2)
  })

  it('ignores regions smaller than minBoxSize', () => {
    const width = 100, height = 100
    const diff = createDiffBuffer(width, height, [{ x: 10, y: 10, w: 5, h: 5 }])
    const boxes = findBoundingBoxes(diff, width, height, [255, 0, 0], 8)
    expect(boxes.length).toBe(0)
  })

  it('respects custom minBoxSize', () => {
    const width = 100, height = 100
    const diff = createDiffBuffer(width, height, [{ x: 10, y: 10, w: 12, h: 12 }])
    expect(findBoundingBoxes(diff, width, height, [255, 0, 0], 15).length).toBe(0)
    expect(findBoundingBoxes(diff, width, height, [255, 0, 0], 5).length).toBe(1)
  })

  it('handles diff pixels at image edges', () => {
    const width = 50, height = 50
    const diff = createDiffBuffer(width, height, [{ x: 0, y: 0, w: 15, h: 15 }])
    const boxes = findBoundingBoxes(diff, width, height)
    expect(boxes.length).toBe(1)
    expect(boxes[0].x).toBe(0)
    expect(boxes[0].y).toBe(0)
  })
})
