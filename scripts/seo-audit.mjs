// Technical SEO audit of the live site. Needs no credentials — it just crawls
// the sitemap and checks what Google would check.
//
//   node scripts/seo-audit.mjs
//   node scripts/seo-audit.mjs --origin https://staging.example.com
//   node scripts/seo-audit.mjs --stdout
//
// Exits 1 if any error-level problem is found, so CI or a cron can gate on it.

import { writeFileSync, mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : d
}

const ORIGIN = opt('origin', 'https://www.kshetejsareen.com').replace(/\/$/, '')
// Vercel's edge fronting returns 403 to bare scripted requests.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// Google truncates around these; over is a warning, not a failure.
const TITLE_MAX = 60
const DESC_MIN = 70
const DESC_MAX = 160

const problems = []
const note = (level, page, msg) => problems.push({ level, page, msg })

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  return { status: res.status, url: res.url, body: await res.text() }
}

const pick = (html, re) => (html.match(re)?.[1] ?? '').trim()
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))

function parse(html) {
  const meta = (name) =>
    decode(pick(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
           pick(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i')))
  const prop = (p) =>
    decode(pick(html, new RegExp(`<meta[^>]+property=["']${p}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
           pick(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${p}["']`, 'i')))

  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try { return JSON.parse(m[1]) } catch { return null }
    })
  const types = jsonLd.filter(Boolean).flatMap((j) =>
    (Array.isArray(j) ? j : [j]).flatMap((o) => o?.['@graph'] ?? [o]).map((o) => o?.['@type']),
  ).filter(Boolean)

  return {
    title: decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i)),
    description: meta('description'),
    robots: meta('robots'),
    canonical: pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    ogTitle: prop('og:title'),
    ogImage: prop('og:image'),
    h1s: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim())).filter(Boolean),
    jsonLdBad: jsonLd.some((j) => j === null),
    schemaTypes: [...new Set(types)],
    words: html.replace(/<script[\s\S]*?<\/script>/gi, '')
               .replace(/<style[\s\S]*?<\/style>/gi, '')
               .replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
  }
}

async function main() {
  const out = []
  const W = (s = '') => out.push(s)

  // --- sitemap + robots -----------------------------------------------------
  const sm = await get(`${ORIGIN}/sitemap.xml`)
  if (sm.status !== 200) {
    note('error', '/sitemap.xml', `returns ${sm.status}`)
    console.error('Sitemap unreachable — cannot continue.')
    process.exit(1)
  }
  const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())

  const robots = await get(`${ORIGIN}/robots.txt`)
  if (robots.status !== 200) note('error', '/robots.txt', `returns ${robots.status}`)
  else if (!robots.body.toLowerCase().includes('sitemap:'))
    note('warn', '/robots.txt', 'does not reference the sitemap')

  // --- crawl ----------------------------------------------------------------
  const pages = []
  const CONCURRENCY = 5
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = await Promise.all(urls.slice(i, i + CONCURRENCY).map(async (u) => {
      const path = new URL(u).pathname
      try {
        const r = await get(u)
        return { path, url: u, status: r.status, finalUrl: r.url, ...parse(r.body) }
      } catch (e) {
        return { path, url: u, status: 0, error: String(e.message) }
      }
    }))
    pages.push(...batch)
  }

  for (const p of pages) {
    if (p.status === 0) { note('error', p.path, `fetch failed: ${p.error}`); continue }
    if (p.status !== 200) { note('error', p.path, `returns ${p.status}`); continue }
    if (p.finalUrl.replace(/\/$/, '') !== p.url.replace(/\/$/, ''))
      note('warn', p.path, `sitemap URL redirects to ${new URL(p.finalUrl).pathname}`)

    if (!p.title) note('error', p.path, 'no <title>')
    else if (p.title.length > TITLE_MAX) note('warn', p.path, `title ${p.title.length} chars, truncates past ${TITLE_MAX}`)

    if (!p.description) note('error', p.path, 'no meta description')
    else if (p.description.length > DESC_MAX) note('warn', p.path, `description ${p.description.length} chars, truncates past ${DESC_MAX}`)
    else if (p.description.length < DESC_MIN) note('warn', p.path, `description only ${p.description.length} chars`)

    if (/noindex/i.test(p.robots)) note('error', p.path, 'is noindex but sits in the sitemap')
    if (!p.canonical) note('warn', p.path, 'no canonical link')
    if (p.h1s.length === 0) note('warn', p.path, 'no <h1>')
    if (p.h1s.length > 1) note('warn', p.path, `${p.h1s.length} <h1> tags`)
    if (!p.ogImage) note('warn', p.path, 'no og:image, shares render bare')
    if (p.jsonLdBad) note('error', p.path, 'malformed JSON-LD block')
    if (!p.schemaTypes.length) note('warn', p.path, 'no structured data')
    if (p.words < 250) note('warn', p.path, `thin content, ~${p.words} words`)
  }

  // Duplicates confuse Google about which page to serve for a term.
  for (const field of ['title', 'description']) {
    const seen = new Map()
    for (const p of pages) {
      if (!p[field]) continue
      if (!seen.has(p[field])) seen.set(p[field], [])
      seen.get(p[field]).push(p.path)
    }
    for (const [value, paths] of seen) {
      if (paths.length > 1)
        note('error', paths.join(', '), `duplicate ${field}: "${value.slice(0, 50)}..."`)
    }
  }

  // --- report ---------------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10)
  const errors = problems.filter((p) => p.level === 'error')
  const warns = problems.filter((p) => p.level === 'warn')

  W(`# Technical SEO audit — ${today}`)
  W()
  W(`${ORIGIN} · ${pages.length} URLs from sitemap · ${errors.length} errors, ${warns.length} warnings`)
  W()

  if (!problems.length) W('Clean. Nothing to fix.')

  for (const [label, list] of [['Errors', errors], ['Warnings', warns]]) {
    if (!list.length) continue
    W(`## ${label}`)
    W()
    for (const p of list) W(`- \`${p.page}\` — ${p.msg}`)
    W()
  }

  W('## Pages')
  W()
  W('```')
  const rows = pages.map((p) => [
    p.path.length > 42 ? `${p.path.slice(0, 39)}...` : p.path,
    String(p.status),
    String(p.title?.length ?? 0),
    String(p.description?.length ?? 0),
    String(p.h1s?.length ?? 0),
    String(p.words ?? 0),
    (p.schemaTypes ?? []).join(',').slice(0, 30) || '—',
  ])
  const heads = ['Path', 'HTTP', 'Title', 'Desc', 'H1', 'Words', 'Schema']
  const w = heads.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)))
  W(heads.map((h, i) => h.padEnd(w[i])).join('  '))
  W(w.map((x) => '-'.repeat(x)).join('  '))
  for (const r of rows) W(r.map((c, i) => c.padEnd(w[i])).join('  '))
  W('```')

  const report = out.join('\n')
  if (flag('stdout')) {
    console.log(report)
  } else {
    mkdirSync('seo-reports', { recursive: true })
    const file = `seo-reports/audit-${today}.md`
    writeFileSync(file, report)
    console.log(`Wrote ${file}`)
    console.log(`${pages.length} URLs · ${errors.length} errors · ${warns.length} warnings`)
  }
  if (errors.length) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
