import type { Metadata } from 'next'
import { KsProjectPage } from '@/components/KsProjectPage'
import { getProject, projectMetaTitle, projectDescription, projectOgImage } from '@/lib/projects'

const CAT = 'motion'
const BASE = 'https://www.kshetejsareen.com'

type Props = { params: Promise<{ projectId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params
  const project = await getProject(CAT, projectId)
  if (!project) return { title: 'Project | Kshetej Sareen', robots: { index: false } }

  const title       = projectMetaTitle(project)
  const description = projectDescription(CAT, project)
  const url         = `${BASE}/${CAT}/projects/${projectId}`
  // Motion projects carry a still cover when one has been set; when they do
  // not, the page ships without a share card rather than borrowing an
  // unrelated frame. Choosing that image is a brand decision, not a fix.
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

export default async function MotionProjectPage({ params }: Props) {
  const { projectId } = await params
  return <KsProjectPage catId={CAT} projectId={projectId} />
}
