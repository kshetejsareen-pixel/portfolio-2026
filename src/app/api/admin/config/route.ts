import { NextResponse } from 'next/server'
import {
  readLandingConfig, writeLandingConfig, CATEGORY_IDS, MAX_FRAMES,
  readCategoryOrder, writeCategoryOrder, DEFAULT_CATEGORY_ORDER,
} from '@/lib/landingConfig'

export async function GET() {
  const [config, categoryOrder] = await Promise.all([
    readLandingConfig(),
    readCategoryOrder(),
  ])
  return NextResponse.json({ config, categoryOrder })
}

export async function PATCH(req: Request) {
  const body = await req.json()

  // Reorder categories
  if (body.type === 'order') {
    const { order } = body
    if (!Array.isArray(order) || order.some((id: unknown) => !CATEGORY_IDS.includes(id as never))) {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
    }
    // Fill in any missing IDs at the end (safety net)
    const full = [...order, ...DEFAULT_CATEGORY_ORDER.filter((id) => !order.includes(id))]
    await writeCategoryOrder(full)
    return NextResponse.json({ categoryOrder: full })
  }

  // Update frame count
  const { categoryId, count } = body
  if (!CATEGORY_IDS.includes(categoryId)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  const clamped = Math.max(1, Math.min(MAX_FRAMES, Number(count)))
  const config = await readLandingConfig()
  config[categoryId] = clamped
  await writeLandingConfig(config)
  return NextResponse.json({ config })
}
