import { NextResponse } from 'next/server'
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rateLimit'
import { generateOtp } from '@/lib/otpStore'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const OTP_KEY = 'admin-otp'

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

  const { error } = await resend.emails.send({
    from: 'Kshetej Sareen Studios <onboarding@resend.dev>',
    to: process.env.ADMIN_EMAIL!,
    subject: `Admin code: ${code}`,
    text: `Your KS Studio admin verification code is:\n\n${code}\n\nExpires in 10 minutes.`,
  })

  if (error) {
    console.error('OTP email error:', error)
    return NextResponse.json(
      { error: 'Could not send verification code.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ step: 'verify' })
}
