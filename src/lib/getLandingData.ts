import { readLandingConfig, readCategoryOrder } from '@/lib/landingConfig'
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

export interface LandingAssignment {
  url: string
  mobileUrl?: string
  title: string
  location: string
  year: string
  camera: string
  focalX?: number
  focalY?: number
}

export interface LandingData {
  config: Record<string, number>
  assignments: Record<string, LandingAssignment>
  categoryOrder: string[]
}

export async function getLandingData(): Promise<LandingData> {
  const [config, store, categoryOrder] = await Promise.all([
    readLandingConfig(),
    getAllAssignmentsPublic(),
    readCategoryOrder(),
  ])

  const assignments: Record<string, LandingAssignment> = {}

  for (const [slotId, data] of Object.entries(store)) {
    if (!slotId.startsWith('landing-')) continue
    assignments[slotId] = {
      url:       buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
      mobileUrl: buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
      title:     data.title,
      location:  data.location,
      year:      data.year,
      camera:    data.camera,
      focalX:    data.focalX,
      focalY:    data.focalY,
    }
  }

  return { config, assignments, categoryOrder }
}
