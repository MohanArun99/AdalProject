import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) ?? null,
  })
}
