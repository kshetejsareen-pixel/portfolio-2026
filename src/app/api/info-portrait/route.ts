import { NextResponse } from 'next/server'
import { getAllAssignmentsPublic } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function buildUrl(publicId: string, angle?: number, flipH?: boolean, flipV?: boolean) {
  const parts: string[] = []
  if (flipH) parts.push('a_hflip')
  if (flipV) parts.push('a_vflip')
  if (angle && angle !== 0) parts.push(`a_${angle}`)
  const t = parts.join('/')
  const mid = t ? `${t}/` : ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${mid}f_auto,q_auto,w_1200/${publicId}`
}

export async function GET() {
  const store = await getAllAssignmentsPublic()
  const data = store['info-portrait']

  if (!data) {
    return NextResponse.json({ portrait: null }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json({
    portrait: {
      url:      buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
      focalX:   data.focalX,
      focalY:   data.focalY,
    },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
