import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

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

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const rows = [
      company     && `Company     : ${company}`,
      projectType && `Project type: ${projectType}`,
      timeline    && `Timeline    : ${timeline}`,
      budget      && `Budget      : ${budget}`,
    ].filter(Boolean).join('\n')

    const { data, error } = await resend.emails.send({
      from:    'KS Studio <info@kshetejsareen.com>',
      to:      'info@kshetejsareen.com',
      replyTo: email,
      subject: `New enquiry${projectType ? ` · ${projectType}` : ''} — ${name}`,
      text: [
        `From: ${name} <${email}>`,
        rows,
        '',
        message,
      ].filter(Boolean).join('\n'),
    })

    if (error) {
      // Log detail server-side; return something generic to the caller.
      console.error('Resend error:', JSON.stringify(error))
      return NextResponse.json(
        { error: 'Could not send your message. Please email info@kshetejsareen.com directly.' },
        { status: 500 },
      )
    }

    console.log('Email sent:', data?.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
