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
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_DIMENSION: 8000,             // 8000 px
} as const

export const ENGINE_DEFAULTS = {
  THRESHOLD: 0.1,
  INCLUDE_AA: false,
  MIN_BOX_SIZE: 8,
  TARGET_WIDTH: 800,
} as const
