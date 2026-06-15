import { NextResponse } from 'next/server'
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rateLimit'
import { generateOtp } from '@/lib/otpStore'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)

const OTP_KEY = 'admin-otp'

async function sendOtpEmail(code: string) {
  await resend.emails.send({
    from: 'KS Studio <info@kshetejsareen.com>',
    to: process.env.ADMIN_EMAIL!,
    subject: `Your admin code: ${code}`,
    text: `Your KS Studio admin verification code is:\n\n${code}\n\nExpires in 10 minutes. If you didn't request this, ignore it.`,
  })
}

async function sendOtpSms(code: string) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  )
  await client.messages.create({
    body: `KS Studio admin code: ${code}. Expires in 10 min.`,
    from: process.env.TWILIO_FROM_NUMBER!,
    to: process.env.ADMIN_PHONE!,
  })
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  resetRateLimit(`login:${ip}`)

  const code = generateOtp(OTP_KEY)

  // Fire both sends; if one fails, log but don't block
  const results = await Promise.allSettled([
    sendOtpEmail(code),
    sendOtpSms(code),
  ])
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`OTP send #${i} failed:`, r.reason)
    }
  })

  // Both failed — don't let the user proceed without a code
  if (results.every((r) => r.status === 'rejected')) {
    return NextResponse.json(
      { error: 'Could not send verification code. Check server logs.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ step: 'verify' })
}
