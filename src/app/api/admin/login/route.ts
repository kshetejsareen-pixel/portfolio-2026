import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return res
}
