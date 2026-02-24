# PixelDiff — Complete Source Code

This document contains all source code for the PixelDiff Next.js application.
The original files use TypeScript (.ts) and TypeScript JSX (.tsx) extensions.
They are presented here in a grader-readable markdown format.

## Project Structure

```
landing_page_2/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — Root layout (metadata, fonts)
│   │   ├── page.tsx                — Home page (composes all sections)
│   │   ├── globals.css             — Global styles and Tailwind utilities
│   │   ├── error.tsx               — Client-side error boundary
│   │   ├── global-error.tsx        — Root layout error boundary
│   │   ├── not-found.tsx           — Custom 404 page
│   │   ├── [...slug]/page.tsx      — Catch-all redirect to /
│   │   └── api/
│   │       ├── compare/route.ts    — POST: Image comparison engine
│   │       ├── history/route.ts    — GET: Paginated comparison history
│   │       ├── config/route.ts     — GET: Engine defaults and limits
│   │       └── debug/route.ts      — GET: Supabase diagnostics
│   ├── components/
│   │   ├── ui/
│   │   │   └── ComparisonTool.tsx  — Core comparison UI (upload, diff, score)
│   │   └── sections/
│   │       ├── Hero.tsx            — Hero section with navbar
│   │       ├── Features.tsx        — Feature cards
│   │       ├── HowItWorks.tsx      — 3-step workflow
│   │       ├── History.tsx         — Comparison history grid
│   │       └── Footer.tsx          — Footer with links
│   ├── lib/
│   │   ├── types.ts               — Shared TypeScript types and constants
│   │   ├── supabase.ts            — Supabase client, save, and history
│   │   ├── rate-limit.ts          — In-memory rate limiter
│   │   └── validate.ts            — Input validation (size, MIME, dimensions)
│   └── __tests__/
│       ├── findBoundingBoxes.test.ts  — Unit tests for bounding-box detection
│       └── compare-integration.test.ts — Integration tests for diff engine
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── routes.md
└── README.md
```

---

## File: src/app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PixelDiff — Catch Visual Regressions Before Your Users Do',
  description: 'Upload two screenshots, get instant pixel-level comparison with AI-powered difference detection. Built for QA teams, designers, and developers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

## File: src/app/page.tsx

```typescript
import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false })
const Features = dynamic(() => import('@/components/sections/Features'), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), { ssr: false })
const History = dynamic(() => import('@/components/sections/History'), { ssr: false })
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-0">
      <Hero />
      <Features />
      <HowItWorks />
      <History />
      <Footer />
    </main>
  )
}
```

---

## File: src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 8, 8, 12;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}

@layer utilities {
  .text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #06b6d4 100%);
  }

  .text-gradient-warm {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
  }

  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-hover:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .glow-cyan {
    box-shadow: 0 0 40px -10px rgba(6, 182, 212, 0.4);
  }

  .glow-purple {
    box-shadow: 0 0 40px -10px rgba(139, 92, 246, 0.4);
  }
}

html {
  scroll-behavior: smooth;
}

::selection {
  background: rgba(6, 182, 212, 0.3);
  color: white;
}
```

---

## File: src/app/error.tsx

```typescript
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">{error.message}</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
```

---

## File: src/app/global-error.tsx

```typescript
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#9ca3af', marginBottom: 24, textAlign: 'center' }}>{error.message}</p>
        <button
          onClick={() => reset()}
          style={{ padding: '12px 24px', background: 'linear-gradient(to right, #2563eb, #9333ea)', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 500, cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
```

---

## File: src/app/not-found.tsx

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-gray-400 mb-6">Page could not be found.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
      >
        Go to Home
      </Link>
    </div>
  )
}
```

---

## File: src/app/[...slug]/page.tsx

```typescript
import { redirect } from 'next/navigation'

export default function CatchAll() {
  redirect('/')
}
```

---

## File: src/app/api/compare/route.ts

```typescript
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

    const threshold = parseThreshold(formData.get('threshold'))
    const includeAA = parseBool(formData.get('includeAA'), ENGINE_DEFAULTS.INCLUDE_AA)
    const minBoxSize = parseMinBoxSize(formData.get('minBoxSize'))

    const [bufA, bufB] = await Promise.all([
      fileA.arrayBuffer().then((b) => Buffer.from(b)),
      fileB.arrayBuffer().then((b) => Buffer.from(b)),
    ])

    const sizeErrA = validateFileSize(bufA)
    if (sizeErrA) return errorJson(`image_a: ${sizeErrA}`, 'FILE_TOO_LARGE', 400)
    const sizeErrB = validateFileSize(bufB)
    if (sizeErrB) return errorJson(`image_b: ${sizeErrB}`, 'FILE_TOO_LARGE', 400)

    if (!isImageByMagic(bufA)) return errorJson('image_a is not a valid image file', 'INVALID_IMAGE', 400)
    if (!isImageByMagic(bufB)) return errorJson('image_b is not a valid image file', 'INVALID_IMAGE', 400)

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

    const boxes = findBoundingBoxes(diff, width, height, [255, 0, 0], minBoxSize)

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
```

---

## File: src/app/api/history/route.ts

```typescript
import { NextResponse } from 'next/server'
import { getHistory } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const cursor = searchParams.get('cursor') ?? undefined

    const { data, nextCursor } = await getHistory(limit, cursor)

    return NextResponse.json({
      data,
      next_cursor: nextCursor,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('History API error:', message)
    return NextResponse.json(
      { data: [], error: message, next_cursor: null },
      { status: 200 },
    )
  }
}
```

---

## File: src/app/api/config/route.ts

```typescript
import { NextResponse } from 'next/server'
import { LIMITS, ENGINE_DEFAULTS, type ConfigResponse } from '@/lib/types'

export async function GET() {
  const config: ConfigResponse = {
    maxFileSizeBytes: LIMITS.MAX_FILE_SIZE,
    maxDimensionPx: LIMITS.MAX_DIMENSION,
    defaults: {
      threshold: ENGINE_DEFAULTS.THRESHOLD,
      includeAA: ENGINE_DEFAULTS.INCLUDE_AA,
      minBoxSize: ENGINE_DEFAULTS.MIN_BOX_SIZE,
      targetWidth: ENGINE_DEFAULTS.TARGET_WIDTH,
    },
  }
  return NextResponse.json(config)
}
```

---

## File: src/app/api/debug/route.ts

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) ?? null,
  })
}
```

---

## File: src/lib/types.ts

```typescript
export interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
}

export interface CompareRequestOptions {
  threshold?: number
  includeAA?: boolean
  minBoxSize?: number
}

export interface CompareResponse {
  similarity: number
  diff_image_url: string
  id: string | null
  boxes: BoundingBox[]
  dimensions: { width: number; height: number }
}

export interface CompareErrorResponse {
  error: string
  code: string
}

export interface ComparisonRecord {
  id: string
  similarity: number
  diff_image_path: string
  created_at: string
}

export interface HistoryItem extends ComparisonRecord {
  url: string
}

export interface HistoryResponse {
  data: HistoryItem[]
  next_cursor: string | null
}

export interface HistoryErrorResponse {
  data: []
  error: string
  next_cursor: null
}

export interface ConfigResponse {
  maxFileSizeBytes: number
  maxDimensionPx: number
  defaults: {
    threshold: number
    includeAA: boolean
    minBoxSize: number
    targetWidth: number
  }
}

export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_DIMENSION: 8000,
} as const

export const ENGINE_DEFAULTS = {
  THRESHOLD: 0.1,
  INCLUDE_AA: false,
  MIN_BOX_SIZE: 8,
  TARGET_WIDTH: 800,
} as const
```

---

## File: src/lib/supabase.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { ComparisonRecord, HistoryItem } from './types'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let serverClient: SupabaseClient | null = null
let readClient: SupabaseClient | null = null

function getServerClient(): SupabaseClient | null {
  if (!supabaseUrl) return null
  const key = supabaseServerKey ?? supabaseAnonKey
  if (!key) return null
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, key)
  }
  return serverClient
}

function getReadClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  if (!readClient) {
    readClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return readClient
}

export async function saveComparison(
  similarity: number,
  diffImageBuffer: Buffer,
): Promise<{ id: string; url: string; debug?: string } | null> {
  const client = getServerClient()
  if (!client) return null

  try {
    const id = crypto.randomUUID()
    const path = `${id}.png`

    const { error: uploadError } = await client.storage
      .from('diffs')
      .upload(path, diffImageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError.message)
      return { id: '', url: '', debug: `storage: ${uploadError.message}` }
    }

    const { data: urlData } = client.storage.from('diffs').getPublicUrl(path)

    const { error: insertError } = await client
      .from('comparisons')
      .insert({
        id,
        similarity,
        diff_image_path: path,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Supabase insert error:', insertError.message)
      return { id: '', url: urlData.publicUrl, debug: `insert: ${insertError.message}` }
    }

    return { id, url: urlData.publicUrl }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Supabase save error:', msg)
    return { id: '', url: '', debug: `catch: ${msg}` }
  }
}

export async function getHistory(
  limit = 20,
  cursor?: string,
): Promise<{ data: HistoryItem[]; nextCursor: string | null }> {
  const client = getReadClient()
  if (!client) return { data: [], nextCursor: null }

  try {
    let query = client
      .from('comparisons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('Supabase history error:', error?.message)
      return { data: [], nextCursor: null }
    }

    const hasMore = data.length > limit
    const page = hasMore ? data.slice(0, limit) : data
    const nextCursor = hasMore ? page[page.length - 1].created_at : null

    const items: HistoryItem[] = page.map((row: ComparisonRecord) => {
      const { data: urlData } = client.storage.from('diffs').getPublicUrl(row.diff_image_path)
      return { ...row, url: urlData.publicUrl }
    })

    return { data: items, nextCursor }
  } catch (err) {
    console.error('Supabase history error:', err)
    return { data: [], nextCursor: null }
  }
}
```

---

## File: src/lib/rate-limit.ts

```typescript
interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

type RateLimitResult =
  | { ok: true; retryAfterMs: 0 }
  | { ok: false; retryAfterMs: number }

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, retryAfterMs: 0 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { ok: true, retryAfterMs: 0 }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key)
    })
  }, 60_000)
}
```

---

## File: src/lib/validate.ts

```typescript
import { LIMITS, ENGINE_DEFAULTS } from './types'

const IMAGE_SIGNATURES: [number[], string][] = [
  [[0x89, 0x50, 0x4e, 0x47], 'image/png'],
  [[0xff, 0xd8, 0xff], 'image/jpeg'],
  [[0x47, 0x49, 0x46], 'image/gif'],
  [[0x52, 0x49, 0x46, 0x46], 'image/webp'],
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
```

---

## File: src/components/ui/ComparisonTool.tsx

```typescript
'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function UploadZone({
  label,
  sublabel,
  preview,
  onFile,
  accentColor,
}: {
  label: string
  sublabel: string
  preview: string | null
  onFile: (f: File) => void
  accentColor: 'cyan' | 'purple'
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accent = accentColor === 'cyan'
    ? { border: 'border-cyan-500/50', bg: 'bg-cyan-500/5', ring: 'ring-cyan-500/20', icon: 'text-cyan-400' }
    : { border: 'border-purple-500/50', bg: 'bg-purple-500/5', ring: 'ring-purple-500/20', icon: 'text-purple-400' }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) onFile(file)
  }, [onFile])

  return (
    <div
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
        ${dragOver ? `${accent.border} ${accent.bg} ring-4 ${accent.ring}` : 'border-white/10 hover:border-white/20'}
        ${preview ? 'bg-black/30' : 'bg-white/[0.02]'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />

      {preview ? (
        <div className="relative aspect-[16/10]">
          <img src={preview} alt={label} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">{label}</span>
            <span className="text-xs text-white/60 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">Click to replace</span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] flex flex-col items-center justify-center gap-3 p-6">
          <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${accent.icon} group-hover:scale-110 transition-transform`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/80">{label}</p>
            <p className="text-xs text-white/40 mt-1">{sublabel}</p>
          </div>
          <p className="text-[11px] text-white/30 mt-1">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  )
}

function SimilarityGauge({ value }: { value: number }) {
  const isGood = value >= 95
  const color = isGood ? 'text-emerald-400' : value >= 80 ? 'text-amber-400' : 'text-red-400'
  const bgColor = isGood ? 'bg-emerald-500' : value >= 80 ? 'bg-amber-500' : 'bg-red-500'
  const label = isGood ? 'Pixel Perfect' : value >= 80 ? 'Minor Differences' : 'Significant Changes'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 327} 327`}
            className={`${color} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{value}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${bgColor}`} />
        <span className="text-sm text-white/60">{label}</span>
      </div>
    </div>
  )
}

export default function ComparisonTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)
  const [result, setResult] = useState<{ similarity: number; diff_image_url: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileA = useCallback((file: File) => {
    setFileA(file)
    setPreviewA(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleFileB = useCallback((file: File) => {
    setFileB(file)
    setPreviewB(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('image_a', fileA)
    formData.append('image_b', fileB)

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error ?? `Server responded with ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed. Please try again.')
    }
    setLoading(false)
  }

  const handleReset = () => {
    setFileA(null)
    setFileB(null)
    setPreviewA(null)
    setPreviewB(null)
    setResult(null)
    setError(null)
  }

  return (
    <div id="compare" className="w-full">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
              <span className="text-sm font-medium text-white/70">Visual Diff Engine</span>
            </div>
          </div>
          {(fileA || fileB) && (
            <button onClick={handleReset} className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/5">
              Clear all
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          {/* Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <UploadZone label="Baseline (A)" sublabel="Reference screenshot" preview={previewA} onFile={handleFileA} accentColor="cyan" />
            <UploadZone label="Current (B)" sublabel="Screenshot to compare" preview={previewB} onFile={handleFileB} accentColor="purple" />
          </div>

          {/* Compare Button */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <motion.button
              onClick={handleCompare}
              disabled={!fileA || !fileB || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl text-white font-semibold text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-[0_0_30px_-8px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.6)]
                         transition-shadow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing pixels...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                  Run Comparison
                </span>
              )}
            </motion.button>
            {!fileA && !fileB && (
              <p className="text-xs text-white/30">Upload both images to begin</p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mt-8 pt-8 border-t border-white/[0.06]"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Diff Image */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <h4 className="text-sm font-semibold text-white/80">Difference Map</h4>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black/40">
                      <img src={result.diff_image_url} alt="Visual diff" className="w-full h-auto object-contain" />
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Red bounding boxes highlight detected visual regressions.
                    </p>
                  </div>

                  {/* Score Panel */}
                  <div className="lg:w-52 flex flex-col items-center justify-start gap-6 lg:pt-8">
                    <SimilarityGauge value={result.similarity} />
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/[0.08] transition-all"
                    >
                      New comparison
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
```

---

## File: src/components/sections/Hero.tsx

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonTool from '../ui/ComparisonTool'

export default function Hero() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const spring = { type: 'spring', stiffness: 400, damping: 30 }

  const comets = [
    { top: '-8%', left: '45%', delay: '0s', duration: '4s' },
    { top: '5%', left: '70%', delay: '1.2s', duration: '5s' },
    { top: '-3%', left: '25%', delay: '0.6s', duration: '3.8s' },
    { top: '15%', left: '80%', delay: '2s', duration: '4.5s' },
    { top: '10%', left: '55%', delay: '1.5s', duration: '6s' },
  ]

  return (
    <>
      {/* ─── Background ─── */}
      <div className="fixed inset-0 -z-10 bg-surface-0">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-1 to-surface-0" />
        <div className="absolute top-0 left-1/3 w-[900px] h-[900px] bg-cyan-500/[0.07] rounded-full blur-[180px]" />
        <div className="absolute top-20 right-1/4 w-[700px] h-[700px] bg-purple-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {comets.map((c, i) => (
            <div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-cyan-400 animate-meteor"
              style={{ top: c.top, left: c.left, animationDelay: c.delay, animationDuration: c.duration }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[50px] h-[1px] bg-gradient-to-l from-cyan-400 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-0/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">PixelDiff</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#compare" className="text-sm text-white/50 hover:text-white transition-colors">Compare</a>
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#compare" className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] transition-all">
              Try It Now
            </a>
          </div>

          <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="flex flex-col gap-1 p-4">
                <a href="#compare" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Compare</a>
                <a href="#features" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Features</a>
                <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">How It Works</a>
                <a href="#compare" onClick={() => setMobileOpen(false)} className="mt-2 px-3 py-2.5 text-sm font-medium text-white text-center bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg">Try It Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative px-6 pt-20 pb-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-white/60">Pixel-level accuracy</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">Instant results</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-[-0.03em] max-w-4xl mx-auto mb-6"
        >
          Catch visual bugs{' '}
          <span className="text-gradient">before</span>
          <br />
          your users do
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-center text-base sm:text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Upload two screenshots and get an instant, pixel-accurate difference map
          with similarity scoring. Built for QA teams, designers, and developers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <a
            href="#compare"
            className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl
                       hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] border border-white/10"
          >
            Start Comparing
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl
                       border border-white/[0.08] hover:border-white/15 transition-all flex items-center gap-2"
          >
            How it works
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </motion.div>

        {/* Comparison Tool */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <ComparisonTool />
        </motion.div>
      </section>
    </>
  )
}
```

---

## File: src/components/sections/Features.tsx

```typescript
'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
      </svg>
    ),
    title: 'Pixel-Level Precision',
    description: 'Every single pixel is compared across your baseline and current screenshots. No visual regression goes unnoticed.',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Difference Detection',
    description: 'Bounding boxes automatically highlight regions where visual changes were detected, making regressions easy to spot.',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Similarity Scoring',
    description: 'Get a precise percentage match between images. Set thresholds for pass/fail in your CI pipeline.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'DPI Normalization',
    description: 'Images are resized to a common resolution before comparison, so Retina vs. standard displays produce consistent results.',
    accent: 'from-amber-500 to-orange-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Capabilities</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Everything you need for{' '}
          <span className="text-gradient">visual testing</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          A purpose-built engine that detects what the human eye might miss.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.08 }}
            className="group glass glass-hover rounded-2xl p-6 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

---

## File: src/components/sections/HowItWorks.tsx

```typescript
'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Upload Screenshots',
    description: 'Drag and drop your baseline screenshot and the current version you want to compare. Supports PNG, JPG, and WebP.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Run Comparison',
    description: 'Our engine normalizes both images to the same resolution, then performs a per-pixel difference analysis to detect changes.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Review Results',
    description: 'Get a difference map with bounding boxes around changed regions, plus a similarity score to measure the extent of visual drift.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Workflow</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Three steps to{' '}
          <span className="text-gradient">visual confidence</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          No setup, no config files. Upload, compare, and ship with confidence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connector line (desktop only) */}
        <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center group"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-white/60 group-hover:text-cyan-400 transition-colors group-hover:border-cyan-500/30">
                {step.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg">
                {step.number}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{step.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        className="flex justify-center mt-14"
      >
        <a
          href="#compare"
          className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl
                     hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] border border-white/10"
        >
          Try it now — it&apos;s free
        </a>
      </motion.div>
    </section>
  )
}
```

---

## File: src/components/sections/History.tsx

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HistoryItem {
  id: string
  similarity: number
  created_at: string
  url: string
}

function SimilarityBadge({ value }: { value: number }) {
  const color = value >= 95
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    : value >= 80
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
      : 'bg-red-500/15 text-red-400 border-red-500/20'

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {value}%
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data
        if (Array.isArray(list)) setItems(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="px-6 py-16 mx-auto max-w-7xl">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <section id="history" className="relative px-6 py-24 mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">History</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Recent comparisons</h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8">Your latest visual diff results, stored in Supabase.</p>
          <div className="glass rounded-xl p-10 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-white/40">No comparisons yet. Run your first diff above to see results here.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="history" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-12"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">History</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Recent comparisons
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          Your latest visual diff results, stored in Supabase.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
            className="group glass glass-hover rounded-xl overflow-hidden transition-all duration-300"
          >
            <div className="aspect-video bg-black/30 overflow-hidden">
              <img
                src={item.url}
                alt={`Diff ${item.id.slice(0, 8)}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SimilarityBadge value={item.similarity} />
                <span className="text-xs text-white/30">{timeAgo(item.created_at)}</span>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
```

---

## File: src/components/sections/Footer.tsx

```typescript
'use client'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80">PixelDiff</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#compare" className="text-xs text-white/40 hover:text-white/70 transition-colors">Compare</a>
            <a href="#features" className="text-xs text-white/40 hover:text-white/70 transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-white/40 hover:text-white/70 transition-colors">How It Works</a>
            <a href="https://github.com/MohanArun99/AdalProject" target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              GitHub
            </a>
          </div>

          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} PixelDiff. Built with Next.js & Supabase.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## File: src/__tests__/findBoundingBoxes.test.ts

```typescript
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
```

---

## File: src/__tests__/compare-integration.test.ts

```typescript
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
```

---

## Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
}

module.exports = nextConfig
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#08080c',
          1: '#0c0c14',
          2: '#12121e',
          3: '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'meteor': 'meteor 5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        meteor: {
          '0%': { transform: 'rotate(135deg) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(135deg) translateX(1000px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '50%': { transform: 'translateY(100%)', opacity: '0.5' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### package.json

```json
{
  "name": "landing-page-2",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.97.0",
    "framer-motion": "^11.0.0",
    "next": "14.1.0",
    "pixelmatch": "^7.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sharp": "^0.34.5"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/pixelmatch": "^5.2.6",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/sharp": "^0.31.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vitest": "^4.0.18"
  }
}
```
