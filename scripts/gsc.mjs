// Shared Google Search Console client.
//
// Auth reuses the existing Firebase service account from .env.local — no new
// credentials. For this to work the service account must be added as a user on
// the Search Console property (see docs/seo-automation.md).

import { readFileSync } from 'node:fs'
import { JWT } from 'google-auth-library'

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const API = 'https://searchconsole.googleapis.com'

// The project parses .env.local by hand elsewhere too — no dotenv installed.
export function loadEnv(path = '.env.local') {
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new Error(`Cannot read ${path}. Run this from the project root.`)
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
}

let cachedClient = null

function client() {
  if (cachedClient) return cachedClient
  const email = process.env.FIREBASE_CLIENT_EMAIL
  const key = process.env.FIREBASE_PRIVATE_KEY
  if (!email || !key) {
    throw new Error('FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY missing from .env.local')
  }
  cachedClient = new JWT({
    email,
    key: key.replace(/\\n/g, '\n'),
    scopes: [SCOPE],
  })
  return cachedClient
}

async function call(path, { method = 'GET', body } = {}) {
  const { token } = await client().getAccessToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    let detail = text
    try {
      detail = JSON.parse(text).error?.message ?? text
    } catch {}
    const err = new Error(`GSC ${res.status}: ${detail}`)
    err.status = res.status
    throw err
  }
  return text ? JSON.parse(text) : {}
}

// Lists properties the service account can see. Doubles as the access check:
// an empty list means the account authenticated but was never granted a property.
export async function listSites() {
  const data = await call('/webmasters/v3/sites')
  return data.siteEntry ?? []
}

// Prefers a domain property (covers every subdomain) over a URL-prefix one.
export async function resolveSite(preferred) {
  const sites = await listSites()
  if (!sites.length) return null
  if (preferred) {
    const hit = sites.find((s) => s.siteUrl === preferred)
    if (hit) return hit.siteUrl
  }
  const domain = sites.find((s) => s.siteUrl.startsWith('sc-domain:'))
  return (domain ?? sites[0]).siteUrl
}

export async function searchAnalytics(siteUrl, body) {
  const data = await call(
    `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: 'POST', body },
  )
  return data.rows ?? []
}

// URL Inspection is a separate v1 API with a much tighter quota
// (2000/day, 600/min) than Search Analytics, so callers should batch modestly.
export async function inspectUrl(siteUrl, inspectionUrl) {
  const data = await call('/v1/urlInspection/index:inspect', {
    method: 'POST',
    body: { inspectionUrl, siteUrl, languageCode: 'en-US' },
  })
  return data.inspectionResult ?? null
}

export function isoDaysAgo(n, from = new Date()) {
  const d = new Date(from)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}
