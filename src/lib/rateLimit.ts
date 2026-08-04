// In-memory rate limiter. Resets per serverless instance restart.
// Good enough to block bots; for multi-region production use Redis/Upstash.

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) return false

  entry.count += 1
  return true
}

export function resetRateLimit(key: string) {
  store.delete(key)
}

// Prefer headers the Vercel proxy sets itself. A client can send any
// x-forwarded-for it likes, so trusting that header first made every limit
// below trivially bypassable by rotating a fake IP on each request.
export function getClientIp(req: Request): string {
  const trusted =
    req.headers.get('x-real-ip') ??
    (req.headers.get('x-vercel-forwarded-for') ?? '').split(',')[0].trim()

  if (trusted) return trusted

  // Local dev / non-Vercel hosting: fall back to the last hop in
  // x-forwarded-for, which is the one appended closest to us.
  const xff = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return xff[xff.length - 1] || 'unknown'
}
