import { getAllAssignmentsPublic } from '@/lib/assignmentsStore'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

function buildTransformStr(angle?: number, flipH?: boolean, flipV?: boolean): string {
  const parts: string[] = []
  if (flipH) parts.push('a_hflip')
  if (flipV) parts.push('a_vflip')
  if (angle && angle !== 0) parts.push(`a_${angle}`)
  return parts.join('/')
}

function buildUrl(publicId: string, angle?: number, flipH?: boolean, flipV?: boolean): string {
  const t = buildTransformStr(angle, flipH, flipV)
  const mid = t ? `${t}/` : ''
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${mid}f_auto,q_auto,w_2400/${publicId}`
}

export interface GalleryAssignment {
  url: string
  title: string
  location: string
  year: string
  camera: string
  focalX?: number
  focalY?: number
}

export interface GalleryData {
  assignments: Record<string, GalleryAssignment>
  hero: { url: string; focalX?: number; focalY?: number } | null
}

export async function getGalleryData(catId: string): Promise<GalleryData> {
  const store   = await getAllAssignmentsPublic()
  const pattern = new RegExp(`^${catId}-(\\d+)$`)

  const assignments: Record<string, GalleryAssignment> = {}
  let hero: { url: string; focalX?: number; focalY?: number } | null = null

  for (const [slotId, data] of Object.entries(store)) {
    if (slotId === `${catId}-hero`) {
      hero = {
        url:    buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
        focalX: data.focalX,
        focalY: data.focalY,
      }
      continue
    }
    const m = slotId.match(pattern)
    if (!m) continue
    assignments[m[1]] = {
      url:      buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
      title:    data.title,
      location: data.location,
      year:     data.year,
      camera:   data.camera,
      focalX:   data.focalX,
      focalY:   data.focalY,
    }
  }

  return { assignments, hero }
}
