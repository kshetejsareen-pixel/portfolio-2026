import { NextResponse } from 'next/server'
import { getAllAssignments } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function thumbUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${publicId}`
}

// Returns a map of slotId → { publicId, url, thumbnailUrl }
// Reads from local data/assignments.json so results are immediate (no Cloudinary indexing lag).
export async function GET() {
  try {
    const store = await getAllAssignments()
    const assignments: Record<string, { publicId: string; url: string; thumbnailUrl: string; focalX?: number; focalY?: number }> = {}

    for (const [slotId, data] of Object.entries(store)) {
      assignments[slotId] = {
        publicId:     data.publicId,
        url:          data.url,
        thumbnailUrl: thumbUrl(data.publicId),
        focalX:       data.focalX,
        focalY:       data.focalY,
      }
    }

    return NextResponse.json({ assignments })
  } catch (err) {
    console.error('Assignments fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}
