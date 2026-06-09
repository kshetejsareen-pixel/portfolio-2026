import { NextResponse } from 'next/server'
import { readFontConfig } from '@/lib/fontConfig'

export async function GET() {
  const config = await readFontConfig()
  return NextResponse.json({ config })
}
