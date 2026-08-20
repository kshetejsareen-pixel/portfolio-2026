// Weekly SEO report from Google Search Console.
//
//   node scripts/seo-report.mjs                 last 28 days vs the 28 before
//   node scripts/seo-report.mjs --days 7        change the window
//   node scripts/seo-report.mjs --index         also run URL Inspection (slow, quota'd)
//   node scripts/seo-report.mjs --stdout        print instead of writing a file
//
// Writes seo-reports/<end-date>.md so successive runs build a history you can diff.

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import {
  loadEnv, resolveSite, searchAnalytics, inspectUrl, isoDaysAgo,
} from './gsc.mjs'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : d
}

const DAYS = Number(opt('days', 28))
// GSC finalises data on a 2-3 day lag; ending "today" reports a false decline.
const LAG = 3
const END = isoDaysAgo(LAG)
const START = isoDaysAgo(LAG + DAYS - 1)
const PREV_END = isoDaysAgo(LAG + DAYS)
const PREV_START = isoDaysAgo(LAG + DAYS * 2 - 1)

const SITE_ORIGIN = 'https://www.kshetejsareen.com'

function landingSlugs() {
  try {
    const src = readFileSync('src/lib/landingPages.ts', 'utf8')
    return [...src.matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
  } catch {
    return []
  }
}

const pct = (now, before) => {
  if (!before) return now ? '  new' : '   —'
  const d = ((now - before) / before) * 100
  const sign = d >= 0 ? '+' : ''
  return `${sign}${d.toFixed(0)}%`
}
const n0 = (v) => Math.round(v).toLocaleString('en-IN')
const n1 = (v) => v.toFixed(1)
const pad = (s, w) => String(s).padEnd(w)
const padL = (s, w) => String(s).padStart(w)

function totals(rows) {
  return rows.reduce(
    (a, r) => ({
      clicks: a.clicks + r.clicks,
      impressions: a.impressions + r.impressions,
      // Weight position by impressions — a plain mean over-counts rare queries.
      posWeighted: a.posWeighted + r.position * r.impressions,
    }),
    { clicks: 0, impressions: 0, posWeighted: 0 },
  )
}

function table(rows, cols) {
  const widths = cols.map((c, i) =>
    Math.max(c.head.length, ...rows.map((r) => String(r[i]).length)),
  )
  const line = (cells, padder) =>
    cells.map((c, i) => padder[i](c, widths[i])).join('  ')
  const padders = cols.map((c) => (c.right ? padL : pad))
  const out = [line(cols.map((c) => c.head), padders)]
  out.push(widths.map((w) => '-'.repeat(w)).join('  '))
  for (const r of rows) out.push(line(r, padders))
  return out.join('\n')
}

async function main() {
  loadEnv()

  const site = await resolveSite(`${SITE_ORIGIN}/`)
  if (!site) {
    console.error(
      'Authenticated, but this service account has no Search Console properties.\n' +
      'Add it as a user in Search Console — see docs/seo-automation.md.',
    )
    process.exit(2)
  }

  const q = (body) => searchAnalytics(site, body)
  const range = { startDate: START, endDate: END }
  const prevRange = { startDate: PREV_START, endDate: PREV_END }

  const [curQueries, prevQueries, curPages, prevPages, byDevice, byCountry] =
    await Promise.all([
      q({ ...range, dimensions: ['query'], rowLimit: 500 }),
      q({ ...prevRange, dimensions: ['query'], rowLimit: 500 }),
      q({ ...range, dimensions: ['page'], rowLimit: 500 }),
      q({ ...prevRange, dimensions: ['page'], rowLimit: 500 }),
      q({ ...range, dimensions: ['device'], rowLimit: 10 }),
      q({ ...range, dimensions: ['country'], rowLimit: 10 }),
    ])

  const cur = totals(curQueries)
  const prev = totals(prevQueries)

  const out = []
  const W = (s = '') => out.push(s)

  W(`# SEO report — ${END}`)
  W()
  W(`Property \`${site}\` · ${START} to ${END} (${DAYS} days), compared with ${PREV_START} to ${PREV_END}.`)
  W(`Search Console finalises data on a lag, so the window ends ${LAG} days back.`)
  W()

  W('## Headline')
  W()
  W('```')
  W(table(
    [
      ['Clicks', n0(cur.clicks), n0(prev.clicks), pct(cur.clicks, prev.clicks)],
      ['Impressions', n0(cur.impressions), n0(prev.impressions), pct(cur.impressions, prev.impressions)],
      ['CTR', `${n1(cur.impressions ? (cur.clicks / cur.impressions) * 100 : 0)}%`,
        `${n1(prev.impressions ? (prev.clicks / prev.impressions) * 100 : 0)}%`, ''],
      ['Avg position', cur.impressions ? n1(cur.posWeighted / cur.impressions) : '—',
        prev.impressions ? n1(prev.posWeighted / prev.impressions) : '—', ''],
      ['Ranking queries', n0(curQueries.length), n0(prevQueries.length), pct(curQueries.length, prevQueries.length)],
    ],
    [{ head: 'Metric' }, { head: 'Now', right: true }, { head: 'Previous', right: true }, { head: 'Change', right: true }],
  ))
  W('```')
  W()

  if (!curQueries.length) {
    W('No search data in this window yet. For a site this new that is normal —')
    W('it means Google has indexed pages but has not served them in results often')
    W('enough to report. Re-run in a week.')
  }

  const fmtRows = (rows, label) =>
    rows.map((r) => [
      r.keys[0].replace(SITE_ORIGIN, '').slice(0, 60) || '/',
      n0(r.clicks), n0(r.impressions),
      `${n1(r.ctr * 100)}%`, n1(r.position),
    ])

  const cols = (head) => [
    { head }, { head: 'Clicks', right: true }, { head: 'Impr', right: true },
    { head: 'CTR', right: true }, { head: 'Pos', right: true },
  ]

  if (curQueries.length) {
    W('## Top queries')
    W()
    W('```')
    W(table(fmtRows(curQueries.slice(0, 25)), cols('Query')))
    W('```')
    W()

    W('## Top pages')
    W()
    W('```')
    W(table(fmtRows(curPages.slice(0, 25)), cols('Page')))
    W('```')
    W()

    // Position 5-20 with real impressions: already relevant to Google, just
    // below the fold. Cheapest wins on the board.
    const striking = curQueries
      .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 10)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 20)

    W('## Striking distance (position 5-20)')
    W()
    if (striking.length) {
      W('Queries Google already considers you relevant for. Moving these up is')
      W('cheaper than ranking something new.')
      W()
      W('```')
      W(table(fmtRows(striking), cols('Query')))
      W('```')
    } else {
      W('Nothing in this band yet.')
    }
    W()

    // High impressions, weak CTR: the ranking works, the title/description does not.
    const weakCtr = curPages
      .filter((r) => r.impressions >= 50 && r.ctr < 0.02 && r.position <= 20)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)

    if (weakCtr.length) {
      W('## Ranking but not getting clicked')
      W()
      W('Seen often, clicked rarely, and ranked well enough that position is not')
      W('the problem. Rewrite the title and meta description on these.')
      W()
      W('```')
      W(table(fmtRows(weakCtr), cols('Page')))
      W('```')
      W()
    }
  }

  // Landing pages get their own scorecard: they are the deliberate SEO bet,
  // and they are easy to lose inside a top-25 list.
  const slugs = landingSlugs()
  if (slugs.length) {
    const byPath = new Map(
      curPages.map((r) => [new URL(r.keys[0]).pathname.replace(/\/$/, ''), r]),
    )
    const prevByPath = new Map(
      prevPages.map((r) => [new URL(r.keys[0]).pathname.replace(/\/$/, ''), r]),
    )
    const rows = slugs.map((s) => {
      const c = byPath.get(`/${s}`)
      const p = prevByPath.get(`/${s}`)
      return [
        s,
        c ? n0(c.clicks) : '0',
        c ? n0(c.impressions) : '0',
        c ? n1(c.position) : '—',
        pct(c?.impressions ?? 0, p?.impressions ?? 0),
      ]
    })
    const live = rows.filter((r) => r[2] !== '0').length

    W('## Landing pages')
    W()
    W(`${live} of ${slugs.length} service-by-city pages have drawn impressions.`)
    W()
    W('```')
    W(table(rows, [
      { head: 'Page' }, { head: 'Clicks', right: true }, { head: 'Impr', right: true },
      { head: 'Pos', right: true }, { head: 'Impr chg', right: true },
    ]))
    W('```')
    W()
  }

  if (byDevice.length || byCountry.length) {
    W('## Split')
    W()
    W('```')
    if (byDevice.length) {
      W(table(fmtRows(byDevice), cols('Device')))
    }
    if (byCountry.length) {
      if (byDevice.length) W('')
      W(table(fmtRows(byCountry.slice(0, 8)), cols('Country')))
    }
    W('```')
    W()
  }

  if (flag('index')) {
    W('## Indexation')
    W()
    const urls = ['/', ...slugs.map((s) => `/${s}`)]
    const results = []
    // Serial with a small gap: the inspection quota is per-minute as well as
    // per-day, and a burst of 21 is enough to trip it.
    for (const path of urls) {
      try {
        const r = await inspectUrl(site, `${SITE_ORIGIN}${path}`)
        results.push([
          path,
          r?.indexStatusResult?.verdict ?? '?',
          r?.indexStatusResult?.coverageState ?? '?',
        ])
      } catch (e) {
        results.push([path, 'ERROR', String(e.message).slice(0, 50)])
      }
      await new Promise((r) => setTimeout(r, 250))
    }
    const indexed = results.filter((r) => r[1] === 'PASS').length
    W(`${indexed} of ${results.length} URLs are indexed.`)
    W()
    W('```')
    W(table(results, [{ head: 'URL' }, { head: 'Verdict' }, { head: 'State' }]))
    W('```')
    W()
  }

  const report = out.join('\n')

  if (flag('stdout')) {
    console.log(report)
    return
  }
  mkdirSync('seo-reports', { recursive: true })
  const file = `seo-reports/${END}.md`
  writeFileSync(file, report)
  console.log(`Wrote ${file}`)
  console.log(
    `${n0(cur.clicks)} clicks / ${n0(cur.impressions)} impressions ` +
    `(${pct(cur.clicks, prev.clicks)} / ${pct(cur.impressions, prev.impressions)})`,
  )
}

main().catch((e) => {
  console.error(`\n${e.message}\n`)
  if (e.status === 403) {
    console.error(
      'A 403 usually means one of two things:\n' +
      '  1. The Search Console API is not enabled on project ks-portfolio-7fa61\n' +
      '  2. The service account has not been added as a user on the property\n' +
      'Both are covered in docs/seo-automation.md.',
    )
  }
  process.exit(1)
})
