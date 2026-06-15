// In-memory OTP store. Single admin, so one entry at a time is fine.
// Resets on serverless cold start — 10-min window makes that a non-issue.

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
}

const store = new Map<string, OtpEntry>()

export function generateOtp(key: string): string {
  const code = Math.floor(100_000 + Math.random() * 900_000).toString()
  store.set(key, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })
  return code
}

export function verifyOtp(key: string, input: string): 'ok' | 'expired' | 'wrong' | 'locked' {
  const entry = store.get(key)
  if (!entry) return 'expired'
  if (Date.now() > entry.expiresAt) { store.delete(key); return 'expired' }
  if (entry.attempts >= MAX_ATTEMPTS) return 'locked'

  if (input !== entry.code) {
    entry.attempts += 1
    return 'wrong'
  }

  store.delete(key)
  return 'ok'
}

export function clearOtp(key: string) {
  store.delete(key)
}
