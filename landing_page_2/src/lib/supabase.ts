import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { ComparisonRecord, HistoryItem } from './types'

// Server-side writes: prefer non-public env vars, fall back to NEXT_PUBLIC_ for compatibility
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

/**
 * Fetch comparison history with keyset pagination.
 * `cursor` is the created_at value of the last item on the previous page.
 */
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
      .limit(limit + 1) // fetch one extra to detect next page

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
