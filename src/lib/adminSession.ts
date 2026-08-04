// Signed admin session tokens.
//
// The cookie used to hold ADMIN_SESSION_SECRET verbatim: one fixed string, the
// same on every login, valid until the env var was rotated by hand. A single
// leak meant permanent access. Now the cookie holds a short payload signed with
// that secret, so every login issues a distinct token and each one carries its
// own expiry.
//
// Uses Web Crypto (not node:crypto) so the same helpers run in middleware.

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface SessionPayload {
  iat: number
  exp: number
  nonce: string
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function createSessionToken(): Promise<string> {
  const now = Date.now()
  const nonceBytes = new Uint8Array(16)
  crypto.getRandomValues(nonceBytes)

  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_MS,
    nonce: b64urlEncode(nonceBytes),
  }

  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(body))
  return `${body}.${b64urlEncode(new Uint8Array(sig))}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false

  const dot = token.indexOf('.')
  if (dot === -1) return false

  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  let sigBytes: Uint8Array
  try {
    sigBytes = b64urlDecode(sig)
  } catch {
    return false
  }

  // crypto.subtle.verify is constant-time, so this does not leak the signature.
  const ok = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(),
    sigBytes as unknown as ArrayBuffer,
    new TextEncoder().encode(body),
  )
  if (!ok) return false

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as SessionPayload
    return typeof payload.exp === 'number' && Date.now() < payload.exp
  } catch {
    return false
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
