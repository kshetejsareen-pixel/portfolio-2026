import { NextRequest, NextResponse } from 'next/server'

// Wire up your email service here (Resend, SendGrid, Nodemailer, etc.)
// For now it logs the payload and returns success so the UI works end-to-end.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, projectType, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: replace with your email provider
    // Example with Resend:
    //   await resend.emails.send({
    //     from: 'studio@ksareen.com',
    //     to: 'studio@ksareen.com',
    //     subject: `New enquiry — ${projectType} — ${name}`,
    //     text: `From: ${name} <${email}>\n\n${message}`,
    //   })
    console.log('Contact form submission:', { name, email, projectType, message })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
