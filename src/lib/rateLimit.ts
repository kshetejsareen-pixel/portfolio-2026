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

export function getClientIp(req: Request): string {
  return (
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  )
}
