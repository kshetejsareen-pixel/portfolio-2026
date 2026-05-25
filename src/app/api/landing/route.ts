import { NextResponse } from 'next/server'
import { readLandingConfig } from '@/lib/landingConfig'
import { getAllAssignments } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

// Re-derive mobile URL from publicId — width-only resize so CSS object-position works.
function mobileUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_900/${publicId}`
}

// Public endpoint — returns frame config + image assignments for the landing page.
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
      mobileUrl: mobileUrl(data.publicId),
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
