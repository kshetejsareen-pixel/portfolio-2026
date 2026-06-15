import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, projectType, timeline, budget, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      console.error('Resend error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Email sent:', data?.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
