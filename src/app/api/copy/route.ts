import { NextResponse } from 'next/server'
import { readCopyConfig } from '@/lib/copyConfig'

export async function GET() {
  const config = await readCopyConfig()
  return NextResponse.json({ copy: config }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
