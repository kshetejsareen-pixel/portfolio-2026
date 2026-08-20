import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { recordLead, markLeadDelivery, type LeadAttribution } from '@/lib/leads'
import { pushLeadAlert } from '@/lib/notify'

const resend = new Resend(process.env.RESEND_API_KEY)

// This endpoint sends real mail from info@kshetejsareen.com on an unauthenticated
// POST. Without a limit, a trivial script can flood the studio inbox, burn the
// Resend quota, and get the sending domain flagged for spam — which then breaks
// ordinary business email. Keep these guards in place.
const MAX_PER_WINDOW = 5
const WINDOW_MS = 60 * 60 * 1000

const LIMITS = {
  name: 120,
  email: 200,
  company: 200,
  projectType: 60,
  timeline: 60,
  budget: 60,
  message: 5000,
} as const

// Attribution is attacker-controlled like everything else in the body, and it
// goes straight into Firestore, so it gets the same caps and scrubbing.
const ATTR_LIMITS = {
  url: 500,
  short: 200,
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Single-line fields: drop every control character, newlines included. `name`
// reaches the Subject header, so it must not carry line breaks.
function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
}

// Message body: keep newlines so paragraphs survive, drop the rest.
function cleanMultiline(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max)
}

function cleanAttribution(v: unknown): LeadAttribution {
  if (!v || typeof v !== 'object') return {}
  const a = v as Record<string, unknown>
  return {
    sourcePage:    clean(a.sourcePage,    ATTR_LIMITS.short) || undefined,
    submittedFrom: clean(a.submittedFrom, ATTR_LIMITS.short) || undefined,
    referrer:      clean(a.referrer,      ATTR_LIMITS.url)   || undefined,
    utmSource:     clean(a.utmSource,     ATTR_LIMITS.short) || undefined,
    utmMedium:     clean(a.utmMedium,     ATTR_LIMITS.short) || undefined,
    utmCampaign:   clean(a.utmCampaign,   ATTR_LIMITS.short) || undefined,
    utmTerm:       clean(a.utmTerm,       ATTR_LIMITS.short) || undefined,
    utmContent:    clean(a.utmContent,    ATTR_LIMITS.short) || undefined,
    gclid:         clean(a.gclid,         ATTR_LIMITS.short) || undefined,
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!checkRateLimit(`contact:${ip}`, MAX_PER_WINDOW, WINDOW_MS)) {
      return NextResponse.json(
        {
          error:
            'Too many enquiries from this connection. Please try again later, or email info@kshetejsareen.com directly.',
        },
        { status: 429 },
      )
    }

    // Reject oversized bodies before parsing.
    const declared = Number(req.headers.get('content-length') ?? 0)
    if (declared > 20_000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 413 })
    }

    const body = await req.json()

    const name        = clean(body.name, LIMITS.name)
    const email       = clean(body.email, LIMITS.email)
    const company     = clean(body.company, LIMITS.company)
    const projectType = clean(body.projectType, LIMITS.projectType)
    const timeline    = clean(body.timeline, LIMITS.timeline)
    const budget      = clean(body.budget, LIMITS.budget)
    const message     = cleanMultiline(body.message, LIMITS.message)
    const attribution = cleanAttribution(body.attribution)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Store before sending. Email is the lossy step - it can bounce, land in
    // spam, or fail outright - so the durable record has to exist first. The
    // write is best-effort and never throws; a null id just means this one
    // enquiry goes unrecorded rather than unsent.
    //
    // Deliberately not storing the IP: it is personal data, it is already used
    // for rate limiting, and country is enough to qualify a lead.
    const leadId = await recordLead({
      name,
      email,
      company:     company     || undefined,
      projectType: projectType || undefined,
      timeline:    timeline    || undefined,
      budget:      budget      || undefined,
      message,
      attribution,
      country:   req.headers.get('x-vercel-ip-country') ?? undefined,
      userAgent: clean(req.headers.get('user-agent'), ATTR_LIMITS.short) || undefined,
    })

    // Fire the phone push before the email round-trip, so the alert is not
    // waiting on Resend. Never throws.
    await pushLeadAlert({
      name,
      email,
      company:     company     || undefined,
      projectType: projectType || undefined,
      budget:      budget      || undefined,
      message,
      sourcePage:  attribution.sourcePage,
    })

    // Put the earning page in the mail itself, so attribution is visible
    // without opening Firestore.
    const origin = [
      attribution.sourcePage && `Landed on   : ${attribution.sourcePage}`,
      attribution.referrer   && `Referrer    : ${attribution.referrer}`,
      attribution.utmSource  && `Campaign    : ${[attribution.utmSource, attribution.utmMedium, attribution.utmCampaign].filter(Boolean).join(' / ')}`,
    ].filter(Boolean).join('\n')

    const rows = [
      company     && `Company     : ${company}`,
      projectType && `Project type: ${projectType}`,
      timeline    && `Timeline    : ${timeline}`,
      budget      && `Budget      : ${budget}`,
    ].filter(Boolean).join('\n')

    const { data, error } = await resend.emails.send({
      from:    'KS Studio <info@kshetejsareen.com>',
      // A second, personal address gets the enquiry onto a phone that
      // actually pushes notifications. Optional - unset, nothing changes.
      to:      ['info@kshetejsareen.com', process.env.LEAD_ALERT_EMAIL].filter(Boolean) as string[],
      replyTo: email,
      subject: `New enquiry${projectType ? ` · ${projectType}` : ''} — ${name}`,
      text: [
        `From: ${name} <${email}>`,
        rows,
        origin,
        '',
        message,
      ].filter(Boolean).join('\n'),
    })

    if (error) {
      // Log detail server-side; return something generic to the caller.
      console.error('Resend error:', JSON.stringify(error))
      if (leadId) await markLeadDelivery(leadId, 'failed', { error: JSON.stringify(error).slice(0, 500) })
      return NextResponse.json(
        { error: 'Could not send your message. Please email info@kshetejsareen.com directly.' },
        { status: 500 },
      )
    }

    if (leadId) await markLeadDelivery(leadId, 'sent', { emailId: data?.id })

    console.log('Email sent:', data?.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
