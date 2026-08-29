import { getGalleryData, type GalleryData } from '@/lib/getGalleryData'
import { getCategoryCopy, type CategoryCopy } from '@/lib/copyConfig'
import { getCategoryProjects, type EnrichedProject } from '@/lib/projects'

// The category page fetches its copy, projects and gallery from /api/* in
// effects. robots.txt disallows /api/, so a crawler renders the page with none
// of it: the live copy is replaced by the categoryData.ts fallback and the
// project grid — the only internal links to /<cat>/projects/* — never appears.
// Reading the same three sources here puts all of it in the HTML. The effects
// stay, so admin edits still land without a rebuild; the rendered page is
// unchanged.
export interface CategoryServerData {
  initialGallery?: GalleryData
  initialCopy?: CategoryCopy
  initialProjects?: EnrichedProject[]
}

// allSettled, not all: one unreachable document should cost that section its
// server render, not the whole page.
export async function getCategoryServerData(catId: string): Promise<CategoryServerData> {
  const [gallery, copy, projects] = await Promise.allSettled([
    getGalleryData(catId),
    getCategoryCopy(catId),
    getCategoryProjects(catId),
  ])

  return {
    initialGallery:  gallery.status  === 'fulfilled' ? gallery.value  : undefined,
    initialCopy:     copy.status     === 'fulfilled' ? copy.value     : undefined,
    initialProjects: projects.status === 'fulfilled' ? projects.value : undefined,
  }
}
