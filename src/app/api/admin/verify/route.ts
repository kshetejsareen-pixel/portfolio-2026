import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyOtp } from '@/lib/otpStore'
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from '@/lib/adminSession'

const OTP_KEY = 'admin-otp'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  // Tight limit on OTP guessing: 10 attempts per IP per 15 minutes
  if (!checkRateLimit(`otp:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const { code } = await req.json()
  const result = await verifyOtp(OTP_KEY, (code ?? '').toString().trim())

  if (result === 'ok') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
    return res
  }

  const messages: Record<string, string> = {
    expired: 'Code expired. Please log in again.',
    wrong: 'Incorrect code.',
    locked: 'Too many wrong attempts. Please log in again.',
  }
  return NextResponse.json(
    { error: messages[result] ?? 'Invalid code.', result },
    { status: 401 },
  )
}
