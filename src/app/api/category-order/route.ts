import { NextResponse } from 'next/server'
import { readCategoryOrder } from '@/lib/landingConfig'

export async function GET() {
  const order = await readCategoryOrder()
  return NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } })
}
