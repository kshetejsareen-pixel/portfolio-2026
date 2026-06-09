import { NextResponse } from 'next/server'
import { readFontConfig, writeFontConfig } from '@/lib/fontConfig'
import type { FontConfig } from '@/lib/fontConfig'

export async function GET() {
  const config = await readFontConfig()
  return NextResponse.json({ config })
}

export async function POST(req: Request) {
  const body: FontConfig = await req.json()
  await writeFontConfig(body)
  return NextResponse.json({ ok: true })
}
