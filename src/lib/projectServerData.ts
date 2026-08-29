import { cache } from 'react'
import cloudinary from '@/lib/cloudinary'
import { getProject, projectCoverUrl, type StoredProject } from '@/lib/projects'

// KsProjectPage fetches the record from /api/projects and the frames from
// /api/project-images in effects. robots.txt disallows /api/, so every one of
// the 42 project pages renders to a crawler as the literal string "Loading…":
// no title in the body, no gallery, no breadcrumb. Reading the same two
// sources here puts the real page in the HTML. The effects stay, so admin
// edits still land without a rebuild; the rendered page is unchanged.

export interface ProjectImage {
  public_id: string
  secure_url: string
  width: number
  height: number
}

export interface ServerProject extends StoredProject {
  coverUrl: string | null
}

export interface ProjectServerData {
  initialProject?: ServerProject
  initialImages?: ProjectImage[]
}

// Same query as GET /api/project-images. cache() dedupes it across
// generateMetadata and the page body within one request.
export const getProjectImages = cache(async (folder: string): Promise<ProjectImage[]> => {
  const result = await cloudinary.search
    .expression(`folder="${folder}" AND resource_type:image`)
    .sort_by('created_at', 'asc')
    .max_results(500)
    .execute()
  return (result.resources ?? []) as ProjectImage[]
})

export async function getProjectServerData(
  catId: string,
  projectId: string,
): Promise<ProjectServerData> {
  const project = await getProject(catId, projectId).catch(() => null)
  if (!project) return {}

  // A Cloudinary outage should cost the page its gallery, not its render.
  const images = await getProjectImages(project.folder).catch(() => null)
  const hidden = new Set(project.hiddenImages ?? [])

  return {
    initialProject: { ...project, coverUrl: projectCoverUrl(project.coverId) },
    initialImages: images ? images.filter((img) => !hidden.has(img.public_id)) : undefined,
  }
}
