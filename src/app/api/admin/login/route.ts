import { NextResponse } from 'next/server'
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  // 5 failed attempts per IP per 15 minutes
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

  // Correct password — clear the rate limit and issue a session cookie
  resetRateLimit(`login:${ip}`)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', process.env.ADMIN_SESSION_SECRET!, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return res
}
