const WINDOW_MS = 60_000

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 30_000)

export function checkRateLimit(ip: string, route: string, limit: number): { ok: boolean; retryAfter: number } {
  const key = `${ip}:${route}`
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, bucket)
  }
  bucket.count++
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}
