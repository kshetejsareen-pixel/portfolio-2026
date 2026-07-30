import { cache } from 'react'
import { readCopyConfig } from '@/lib/copyConfig'
import { getAllAssignmentsPublic } from '@/lib/assignmentsStore'
import type { InfoCopy } from '@/lib/copyConfig'

export interface PortraitData { url: string; focalX?: number; focalY?: number }

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

export async function getInfoCopy(): Promise<InfoCopy> {
  const config = await readCopyConfig()
  return (config.info as InfoCopy) ?? {}
}

// cache() dedupes the Firestore read between generateMetadata and the page.
export const getInfoPortrait = cache(async (): Promise<PortraitData | null> => {
  const store = await getAllAssignmentsPublic()
  const data = store['info-portrait']
  if (!data) return null
  return {
    url:    buildUrl(data.publicId, data.angle, data.flipH, data.flipV),
    focalX: data.focalX,
    focalY: data.focalY,
  }
})
