# PixelDiff

**Catch visual bugs before your users do.**

PixelDiff is a pixel-level visual comparison tool built with Next.js 14 (App Router). Upload two screenshots, get an instant diff image with bounding boxes around changed regions and a similarity score.

**Live:** https://landingpage2-phi.vercel.app
**Repo:** https://github.com/MohanArun99/AdalProject

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser (React + Tailwind + Framer Motion)              │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐            │
│  │ ComparisonTool│ │ History  │  │ Features │ ...        │
│  └──────┬───────┘  └────┬─────┘  └──────────┘            │
│         │POST            │GET                             │
├─────────┼────────────────┼────────────────────────────────┤
│  Next.js API Routes (Node.js runtime)                     │
│  ┌──────▼───────┐  ┌────▼─────┐  ┌──────────┐           │
│  │ /api/compare │  │/api/history│ │/api/config│           │
│  │ sharp + pixel│  │ pagination│  │ defaults  │           │
│  │ match + rate │  └────┬─────┘  └──────────┘           │
│  │ limit + valid│       │                                 │
│  └──────┬───────┘       │                                 │
├─────────┼───────────────┼─────────────────────────────────┤
│  Supabase                                                 │
│  ┌──────▼───────┐  ┌────▼─────┐                          │
│  │ Storage(diffs)│  │comparisons│  (Postgres)             │
│  └──────────────┘  └──────────┘                          │
└──────────────────────────────────────────────────────────┘
```

## Routes

See [routes.md](./routes.md) for the full routes index.

| Path | Method | Description |
|------|--------|-------------|
| `/` | GET | Landing page |
| `/api/compare` | POST | Image comparison engine |
| `/api/history` | GET | Paginated comparison history |
| `/api/config` | GET | Engine defaults and limits |

## Quick Start

```bash
cd landing_page_2
cp .env.local.example .env.local   # fill in Supabase keys
npm install
npm run dev                         # http://localhost:3000
```

## API Examples

### Compare two images

```bash
curl -X POST http://localhost:3000/api/compare \
  -F "image_a=@baseline.png" \
  -F "image_b=@current.png"
```

Response:
```json
{
  "similarity": 94.23,
  "diff_image_url": "https://...supabase.co/.../abc123.png",
  "id": "abc123-...",
  "boxes": [{ "x": 120, "y": 50, "w": 80, "h": 40 }],
  "dimensions": { "width": 800, "height": 600 }
}
```

### With custom thresholds

```bash
curl -X POST http://localhost:3000/api/compare \
  -F "image_a=@baseline.png" \
  -F "image_b=@current.png" \
  -F "threshold=0.2" \
  -F "includeAA=true" \
  -F "minBoxSize=12"
```

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `threshold` | float | 0.1 | 0–1 | Pixelmatch color distance threshold. Higher = more tolerant. |
| `includeAA` | bool | false | — | Include anti-aliased pixels in diff. |
| `minBoxSize` | int | 8 | 1–200 | Minimum bounding-box dimension (px) to report. |

### Fetch history (paginated)

```bash
# First page
curl "http://localhost:3000/api/history?limit=10"

# Next page (use next_cursor from previous response)
curl "http://localhost:3000/api/history?limit=10&cursor=2026-02-23T20:53:03.878Z"
```

Response:
```json
{
  "data": [
    { "id": "...", "similarity": 94.23, "diff_image_path": "abc.png", "created_at": "...", "url": "https://..." }
  ],
  "next_cursor": "2026-02-23T20:51:19.623+00:00"
}
```

### Get engine config

```bash
curl http://localhost:3000/api/config
```

```json
{
  "maxFileSizeBytes": 10485760,
  "maxDimensionPx": 8000,
  "defaults": { "threshold": 0.1, "includeAA": false, "minBoxSize": 8, "targetWidth": 800 }
}
```

## Input Validation & Safety

| Check | Limit |
|-------|-------|
| File size | ≤ 10 MB per image |
| Dimensions | ≤ 8000 × 8000 px |
| MIME type | Must match known image magic bytes (PNG, JPEG, GIF, WebP, BMP) |
| Rate limit | 10 requests/minute per IP on `/api/compare` |
| Content-Type | Must be `multipart/form-data` |

## Error Codes

All error responses follow a consistent shape:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

| Code | HTTP | Meaning |
|------|------|---------|
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_CONTENT_TYPE` | 400 | Not multipart/form-data |
| `MISSING_FILES` | 400 | image_a or image_b missing |
| `FILE_TOO_LARGE` | 400 | Exceeds 10 MB |
| `INVALID_IMAGE` | 400 | Not a recognized image format |
| `DIMENSIONS_EXCEEDED` | 400 | Exceeds 8000×8000 |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Tests

```bash
npm test          # run once
npm run test:watch # watch mode
```

9 tests across 2 suites:
- **findBoundingBoxes** — unit tests for the flood-fill bounding-box detection algorithm
- **compare-integration** — end-to-end tests asserting similarity scores for known image pairs

## Supabase Setup

### Database

Create a `comparisons` table:

```sql
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  similarity NUMERIC NOT NULL,
  diff_image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Storage

Create a bucket named `diffs` (public).

### RLS Policies

**`comparisons` table:**

```sql
-- Allow anyone to read comparisons
CREATE POLICY "Public read" ON comparisons FOR SELECT USING (true);

-- Allow anyone to insert (anonymous comparisons)
CREATE POLICY "Public insert" ON comparisons FOR INSERT WITH CHECK (true);
```

**`diffs` storage bucket:**

In Supabase Dashboard → Storage → `diffs` → Policies:

```sql
-- Allow anyone to upload diff images
CREATE POLICY "Public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diffs');

-- Allow anyone to read diff images
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'diffs');
```

### Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Server | Supabase project URL (preferred) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key for writes (bypasses RLS) |
| `SUPABASE_ANON_KEY` | Server | Anon key fallback for reads |
| `NEXT_PUBLIC_SUPABASE_URL` | Client+Server | Fallback project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client+Server | Fallback anon key |

For production, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-only env vars in Vercel (no `NEXT_PUBLIC_` prefix) to keep the service role key out of client bundles.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Image processing:** Sharp (resize, composite) + Pixelmatch (diff)
- **Database:** Supabase (Postgres + Storage)
- **Deployment:** Vercel
- **Testing:** Vitest

## Deployment

```bash
vercel --prod
```

Ensure environment variables are set in Vercel project settings.
