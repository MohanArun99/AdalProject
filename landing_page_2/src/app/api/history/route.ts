import { NextResponse } from 'next/server'
import { getHistory } from '@/lib/supabase'

export async function GET() {
  try {
    const history = await getHistory(20)
    return NextResponse.json(history)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('History API error:', message)
    return NextResponse.json([], { status: 200 })
  }
}
