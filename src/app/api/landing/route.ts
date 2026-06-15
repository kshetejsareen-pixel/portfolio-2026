import { NextResponse } from 'next/server'
import { getLandingData } from '@/lib/getLandingData'

export async function GET() {
  const data = await getLandingData()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
