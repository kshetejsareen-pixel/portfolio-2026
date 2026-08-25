import type { Metadata } from 'next'
import { KsProjectPage } from '@/components/KsProjectPage'
import { getProject, projectTitle, projectDescription, projectOgImage } from '@/lib/projects'

const CAT = 'spaces'
const BASE = 'https://www.kshetejsareen.com'

type Props = { params: Promise<{ projectId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProject(CAT, projectId)
  if (!project) return { title: 'Project | Kshetej Sareen', robots: { index: false } }

  const title       = `${projectTitle(project)} | Kshetej Sareen`
  const description = projectDescription(CAT, project)
  const url         = `${BASE}/${CAT}/projects/${projectId}`
  const ogImage     = projectOgImage(project)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function SpacesProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId={CAT} projectId={projectId} />
}
