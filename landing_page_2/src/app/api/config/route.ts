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
