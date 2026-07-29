import { getAdminClient } from '@/lib/supabaseAdmin'

export const RATE_LIMITS = {
  SESSION_PER_DAY: 15,
  IP_PER_DAY: 45,
} as const

async function checkAndIncrement(
  identifier: string,
  limit: number,
): Promise<{ ok: boolean }> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const supabase = getAdminClient()
    const { data: record } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('ip_address', identifier)
      .eq('date', today)
      .maybeSingle()

    if (record && record.count >= limit) {
      return { ok: false }
    }
    if (record) {
      await supabase
        .from('rate_limits')
        .update({ count: record.count + 1 })
        .eq('ip_address', identifier)
        .eq('date', today)
    } else {
      await supabase
        .from('rate_limits')
        .insert({ ip_address: identifier, date: today, count: 1 })
    }
    return { ok: true }
  } catch {
    return { ok: true }
  }
}

export async function enforceRateLimit(
  ip: string,
  sessionId: string | null,
): Promise<{ ok: true } | { ok: false; reason: 'session' | 'ip' }> {
  if (sessionId) {
    const s = await checkAndIncrement('sess:' + sessionId, RATE_LIMITS.SESSION_PER_DAY)
    if (!s.ok) return { ok: false, reason: 'session' }
  }
  const i = await checkAndIncrement(ip, RATE_LIMITS.IP_PER_DAY)
  if (!i.ok) return { ok: false, reason: 'ip' }
  return { ok: true }
}
