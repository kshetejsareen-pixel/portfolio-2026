import { NextResponse } from 'next/server'
import { getAllAssignmentsPublic } from '@/lib/assignmentsStore'

// Public endpoint — returns gallery slot assignments for a given category page.
// Reads from local data/assignments.json so results are immediate (no Cloudinary indexing lag).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const catId = searchParams.get('catId')

  if (!catId) return NextResponse.json({ error: 'catId required' }, { status: 400 })

  const store = await getAllAssignmentsPublic()
  const pattern = new RegExp(`^${catId}-(\\d+)$`)

  const assignments: Record<string, {
    url: string
    title: string
    location: string
    year: string
    camera: string
    focalX?: number
    focalY?: number
  }> = {}

  for (const [slotId, data] of Object.entries(store)) {
    const m = slotId.match(pattern)
    if (!m) continue
    assignments[m[1]] = {
      url:      data.url,
      title:    data.title,
      location: data.location,
      year:     data.year,
      camera:   data.camera,
      focalX:   data.focalX,
      focalY:   data.focalY,
    }
  }

  return NextResponse.json({ assignments }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
