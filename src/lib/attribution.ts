// First-touch attribution, captured in the browser.
//
// A visitor who converts almost never submits from the page that earned them:
// they land on /corporate-photographer-gurgaon from a search, then click through
// to /contact. Reading the pathname at submit time would credit every lead to
// /contact and tell us nothing. So we stamp the first page of the session once
// and carry it forward.
//
// sessionStorage, not localStorage or a cookie: it expires with the tab, needs
// no consent banner, and a returning visitor on a new session is genuinely a
// new touch.

const KEY = 'ks:attr'

export interface StoredAttribution {
  sourcePage?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  gclid?: string
}

function safeSession(): Storage | null {
  try {
    // Private-mode Safari and some embedded webviews throw on access.
    return window.sessionStorage
  } catch {
    return null
  }
}

// Writes the first-touch record if this session does not already have one.
// Subsequent calls are deliberately no-ops — later pageviews must not overwrite
// the page that actually won the visit.
export function captureFirstTouch(): void {
  const store = safeSession()
  if (!store || store.getItem(KEY)) return

  const params = new URLSearchParams(window.location.search)
  const param = (n: string) => params.get(n) ?? undefined

  // Same-origin referrers are internal navigation, not a traffic source.
  let referrer: string | undefined
  try {
    if (document.referrer && new URL(document.referrer).hostname !== window.location.hostname) {
      referrer = document.referrer
    }
  } catch {}

  const attr: StoredAttribution = {
    sourcePage:  window.location.pathname,
    referrer,
    utmSource:   param('utm_source'),
    utmMedium:   param('utm_medium'),
    utmCampaign: param('utm_campaign'),
    utmTerm:     param('utm_term'),
    utmContent:  param('utm_content'),
    gclid:       param('gclid'),
  }

  try {
    store.setItem(KEY, JSON.stringify(attr))
  } catch {}
}

// Reads the session's first touch and adds where the form was actually
// submitted from. Returns an empty object rather than throwing so a storage
// failure can never block a submission.
export function readAttribution(): StoredAttribution & { submittedFrom?: string } {
  const store = safeSession()
  let stored: StoredAttribution = {}
  try {
    const raw = store?.getItem(KEY)
    if (raw) stored = JSON.parse(raw) as StoredAttribution
  } catch {}

  return {
    ...stored,
    submittedFrom: typeof window === 'undefined' ? undefined : window.location.pathname,
  }
}
