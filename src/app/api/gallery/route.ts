import { NextResponse } from 'next/server'
import { getGalleryData } from '@/lib/getGalleryData'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const catId = searchParams.get('catId')
  if (!catId) return NextResponse.json({ error: 'catId required' }, { status: 400 })

  const data = await getGalleryData(catId)
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
