# SEO automation

Two scripts. One needs Google access, one does not.

| Command | Needs credentials | What it tells you |
| --- | --- | --- |
| `npm run seo:audit` | No | Technical health of the live site — titles, descriptions, schema, duplicates, broken URLs |
| `npm run seo:report` | Yes, Search Console | Actual performance — clicks, impressions, positions, which queries you rank for |

Reports are written to `seo-reports/`, dated, so successive runs can be diffed.

## One-time setup for `seo:report`

Auth reuses the Firebase service account already in `.env.local`. There are no new
credentials to create and nothing new to store. Two steps, both in a browser,
maybe five minutes.

### 1. Enable the Search Console API

Open this and press **Enable**:

https://console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=ks-portfolio-7fa61

This is the Google Cloud project that already backs Firestore. Enabling the API
costs nothing — Search Console has no paid tier.

### 2. Grant the service account access to the property

Open Search Console, pick the `kshetejsareen.com` property, then
**Settings → Users and permissions → Add user**.

Add this address with **Full** permission:

```
firebase-adminsdk-fbsvc@ks-portfolio-7fa61.iam.gserviceaccount.com
```

`Full` rather than `Restricted` only because the URL Inspection API — the part
that reports whether a page is indexed — is refused to restricted users. The
scripts only ever read; the OAuth scope requested is `webmasters.readonly`, so
nothing here can change your property even if it wanted to.

### 3. Verify

```bash
npm run seo:report
```

Success prints a headline line and writes `seo-reports/<date>.md`. A 403 means
step 1 or 2 has not propagated — Google can take a few minutes.

## Usage

```bash
npm run seo:audit                              # technical audit, live site
npm run seo:report                             # last 28 days vs the 28 before
node scripts/seo-report.mjs --days 7           # weekly window
node scripts/seo-report.mjs --index            # add per-URL indexation status
node scripts/seo-report.mjs --stdout           # print instead of writing a file
node scripts/seo-audit.mjs --origin http://localhost:3000
```

`--index` calls the URL Inspection API once per URL. It is rate-limited to 2000
calls a day and 600 a minute, so it runs serially and takes about ten seconds
for the current 28 URLs. Leave it off for routine runs.

## What the report flags

**Striking distance** — queries ranking 5–20. Google already considers the page
relevant; it is just below where anyone clicks. Cheaper to improve than to rank
something new.

**Ranking but not getting clicked** — 50+ impressions, under 2% CTR, position 20
or better. Position is not the problem, so the title and meta description are.

**Landing pages** — a scorecard for the 20 service-by-city pages specifically,
since they are the deliberate SEO bet and get lost inside a top-25 list.

## Notes

Search Console finalises data on a two-to-three day lag, so both windows end
three days back. Comparing to "today" reports a decline that is not real.

Average position is weighted by impressions. An unweighted mean lets a query
with two impressions count as much as one with two thousand.

`seo-reports/` is committed deliberately — the value is the trend, and a report
that only exists on one laptop cannot be diffed.

## Not covered

Rankings are one input. These still matter and no script does them:

- **Google Business Profile** — for local intent like "food photographer delhi",
  the map pack usually outranks anything on the site. Still not set up.
- **Backlinks** — Search Console reports referring domains but the scripts do
  not pull them yet. Worth adding once there is something to report.
