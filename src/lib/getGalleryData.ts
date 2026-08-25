import { cache } from 'react'
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

// cache() dedupes the Firestore read when both generateMetadata and the
// page component request the same category within one request.
export const getGalleryData = cache(async (catId: string): Promise<GalleryData> => {
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
})

// Motion is a video category — its image slots are intentionally empty, so the
// normal hero/first-frame lookup finds nothing and the page ships with no share
// card. Fall back to the banner film's YouTube poster (then the first film's),
// which tracks whatever is set in the admin panel with no extra asset to manage.
async function motionPosterFallback(): Promise<string | undefined> {
  try {
    const { readMotionVideos } = await import('@/lib/motionVideos')
    const { videos, bannerVideoId } = await readMotionVideos()
    const id = bannerVideoId ?? videos[0]?.youtubeId
    return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : undefined
  } catch {
    return undefined
  }
}

export async function getCategoryOgImage(catId: string): Promise<string | undefined> {
  try {
    const { hero, assignments } = await getGalleryData(catId)
    const first = Object.keys(assignments)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => assignments[k].url)[0]
    const url = hero?.url ?? first
    if (url) return url.replace('w_2400', 'w_1200')
    if (catId === 'motion') return await motionPosterFallback()
    return undefined
  } catch {
    return undefined
  }
}
