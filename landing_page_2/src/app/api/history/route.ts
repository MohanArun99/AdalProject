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
