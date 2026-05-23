import { NextResponse } from 'next/server'
import { readLandingConfig, writeLandingConfig, CATEGORY_IDS, MAX_FRAMES } from '@/lib/landingConfig'

export async function GET() {
  const config = await readLandingConfig()
  return NextResponse.json({ config })
}

export async function PATCH(req: Request) {
  const { categoryId, count } = await req.json()

  if (!CATEGORY_IDS.includes(categoryId)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const clamped = Math.max(1, Math.min(MAX_FRAMES, Number(count)))
  const config = await readLandingConfig()
  config[categoryId] = clamped
  await writeLandingConfig(config)

  return NextResponse.json({ config })
}
