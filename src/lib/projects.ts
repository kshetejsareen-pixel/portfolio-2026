import { cache } from 'react'
import { firestoreRead } from '@/lib/firestoreStore'

// The project pages are client components that fetch /api/projects in an
// effect, so until now they shipped no title, description or share card of
// their own — every one of them inherited the root layout's. That is the
// reason named-venue searches ("haiku restaurant", "crowne plaza hotel
// gurgaon") land on a category page at position 25–70 instead of on the
// project itself. This module gives the routes something to render metadata
// from on the server; the visible page is unchanged.

const CLOUD  = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'
const DOC_ID = 'ks-projects-config'

export interface StoredProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  imageCount?: number
  tags?: string[]
}

// cache() dedupes the Firestore read across generateMetadata, the page body and
// the sitemap within a single request.
export const getProjectsByCategory = cache(
  async (): Promise<Record<string, StoredProject[]>> =>
    firestoreRead<Record<string, StoredProject[]>>(DOC_ID, {}),
)

export async function getProject(catId: string, projectId: string): Promise<StoredProject | null> {
  const all = await getProjectsByCategory()
  return (all[catId] ?? []).find((p) => p.id === projectId) ?? null
}

// Titles come from Cloudinary folder names, so separators arrive as runs of
// spaces ("RAVOH   Experience Centre Gurgaon"). Collapse them rather than
// guessing at what punctuation was intended.
export function projectTitle(p: StoredProject): string {
  return p.title.replace(/\s+/g, ' ').trim()
}

const CATEGORY_LABEL: Record<string, string> = {
  culinary:  'Food & beverage photography',
  spaces:    'Architecture & interior design photography',
  objects:   'Product & still life photography',
  portraits: 'Portrait photography',
  motion:    'Film & motion',
}

// Deliberately templated. The stored records carry no description, location or
// year — only a title and a cover image — so anything more specific than this
// would be invented.
export function projectDescription(catId: string, p: StoredProject): string {
  const label = CATEGORY_LABEL[catId] ?? 'Photography'
  return `${projectTitle(p)} — ${label.toLowerCase()} by Kshetej Sareen. Selected frames from the commission.`
}

export function projectOgImage(p: StoredProject): string | undefined {
  if (!p.coverId) return undefined
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_1200,q_auto,f_auto/${p.coverId}`
}
