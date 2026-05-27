import { NextResponse } from 'next/server'
import { getAllAssignments } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function buildTransformStr(angle?: number, flipH?: boolean, flipV?: boolean): string {
  const parts: string[] = []
  if (flipH) parts.push('a_hflip')
  if (flipV) parts.push('a_vflip')
  if (angle && angle !== 0) parts.push(`a_${angle}`)
  return parts.join('/')
}

function thumbUrl(publicId: string, angle?: number, flipH?: boolean, flipV?: boolean) {
  const t = buildTransformStr(angle, flipH, flipV)
  const mid = t ? `${t}/` : ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${mid}w_400,h_300,c_fill,q_auto,f_auto/${publicId}`
}

// Returns a map of slotId → { publicId, url, thumbnailUrl }
// Reads from local data/assignments.json so results are immediate (no Cloudinary indexing lag).
export async function GET() {
  try {
    const store = await getAllAssignments()
    const assignments: Record<string, { publicId: string; url: string; thumbnailUrl: string; focalX?: number; focalY?: number; angle?: number; flipH?: boolean; flipV?: boolean; title?: string; location?: string; year?: string; camera?: string }> = {}

    for (const [slotId, data] of Object.entries(store)) {
      assignments[slotId] = {
        publicId:     data.publicId,
        url:          data.url,
        thumbnailUrl: thumbUrl(data.publicId, data.angle, data.flipH, data.flipV),
        focalX:       data.focalX,
        focalY:       data.focalY,
        angle:        data.angle,
        flipH:        data.flipH,
        flipV:        data.flipV,
        title:        data.title,
        location:     data.location,
        year:         data.year,
        camera:       data.camera,
      }
    }

    return NextResponse.json({ assignments })
  } catch (err) {
    console.error('Assignments fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}
