import { NextResponse } from 'next/server'
import { readLandingConfig } from '@/lib/landingConfig'
import { getAllAssignments } from '@/lib/assignmentsStore'

// Public endpoint — returns frame config + image assignments for the landing page.
// Reads from local data/assignments.json so results are immediate (no Cloudinary indexing lag).
export async function GET() {
  const [config, store] = await Promise.all([
    readLandingConfig(),
    getAllAssignments(),
  ])

  const assignments: Record<string, {
    url: string
    mobileUrl: string
    title: string
    location: string
    year: string
    camera: string
    focalX?: number
    focalY?: number
  }> = {}

  for (const [slotId, data] of Object.entries(store)) {
    if (!slotId.startsWith('landing-')) continue
    assignments[slotId] = {
      url:       data.url,
      mobileUrl: data.mobileUrl,
      title:     data.title,
      location:  data.location,
      year:      data.year,
      camera:    data.camera,
      focalX:    data.focalX,
      focalY:    data.focalY,
    }
  }

  return NextResponse.json({ config, assignments }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
