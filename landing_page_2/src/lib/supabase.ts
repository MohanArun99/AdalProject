import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
  return supabase
}

export interface ComparisonRecord {
  id: string
  similarity: number
  diff_image_path: string
  created_at: string
}

/**
 * Persist a comparison result to Supabase.
 * Uploads the diff image to Storage and inserts a row into the comparisons table.
 * Returns { id, url } on success, or null if Supabase is not configured.
 */
export async function saveComparison(
  similarity: number,
  diffImageBuffer: Buffer,
): Promise<{ id: string; url: string } | null> {
  const client = getClient()
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
      return null
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
      return null
    }

    return { id, url: urlData.publicUrl }
  } catch (err) {
    console.error('Supabase save error:', err)
    return null
  }
}

/**
 * Fetch recent comparison history from Supabase.
 * Returns an empty array if Supabase is not configured.
 */
export async function getHistory(limit = 20): Promise<(ComparisonRecord & { url: string })[]> {
  const client = getClient()
  if (!client) return []

  try {
    const { data, error } = await client
      .from('comparisons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((row: ComparisonRecord) => {
      const { data: urlData } = client.storage.from('diffs').getPublicUrl(row.diff_image_path)
      return { ...row, url: urlData.publicUrl }
    })
  } catch {
    return []
  }
}
