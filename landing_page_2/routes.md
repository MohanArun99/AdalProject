# PixelDiff — Routes Index

## Pages (App Router)

| Path | Type | Auth | Description |
|------|------|------|-------------|
| `/` | Page | Public | Landing page — hero, features, how-it-works, comparison tool, history, footer |
| `/[...slug]` | Catch-all | Public | Redirects any unknown path back to `/` |

## API Routes

| Path | Method | Auth | Description |
|------|--------|------|-------------|
| `/api/compare` | `POST` | Public | Accepts `multipart/form-data` with `image_a` and `image_b`. Returns similarity score, diff image URL, bounding boxes, and comparison ID. Supports optional tuning params: `threshold`, `includeAA`, `minBoxSize`. Rate-limited to 10 req/min per IP. |
| `/api/history` | `GET` | Public | Returns recent comparisons with pagination. Query params: `limit` (default 20, max 100), `cursor` (ISO timestamp for keyset pagination). |
| `/api/config` | `GET` | Public | Returns engine defaults and server capabilities (max file size, max dimensions, default threshold). |
| `/api/debug` | `GET` | Public | Diagnostic endpoint — reports whether Supabase env vars are loaded. |

## Error Boundaries

| Path | Type | Description |
|------|------|-------------|
| `not-found.tsx` | 404 | Custom not-found page |
| `error.tsx` | Error | Client-side error boundary |
| `global-error.tsx` | Error | Root layout error boundary |

## Data Flow

```
Browser (ComparisonTool.tsx)
  │  POST /api/compare (FormData: image_a, image_b, threshold?, includeAA?, minBoxSize?)
  ▼
API Route (route.ts)
  ├─ Validate: MIME type, file size (≤10 MB), dimensions (≤8000×8000)
  ├─ Resize with Sharp → normalize to same dimensions
  ├─ Pixelmatch diff → similarity score
  ├─ findBoundingBoxes → cluster diff pixels into regions
  ├─ buildBoxOverlays → draw red bounding boxes on image B
  ├─ saveComparison → upload diff PNG to Supabase Storage + insert row
  └─ Return { similarity, diff_image_url, id, boxes }

Browser (History.tsx)
  │  GET /api/history?limit=20
  ▼
API Route → Supabase SELECT comparisons ORDER BY created_at DESC
```
