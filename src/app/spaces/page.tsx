import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { spacesData } from '@/lib/categoryData'
import { getCategoryOgImage } from '@/lib/getGalleryData'
import { getCategoryServerData } from '@/lib/categoryServerData'

// The page is prerendered, so the copy and project links baked into the HTML are
// what crawlers see. Regenerate hourly rather than only on deploy, matching the
// sitemap, so admin edits reach the index without a rebuild.
export const revalidate = 3600

const TITLE = 'Architectural & Interior Photography — Kshetej Sareen'
const DESCRIPTION = 'Architectural and interior photographer for residences, hotels and offices across Delhi, Gurgaon, Bangalore and Hyderabad. Published in Architectural Digest.'
const URL = 'https://www.kshetejsareen.com/spaces'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getCategoryOgImage('spaces')
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: URL },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: URL,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: 'Interior and architectural photography by Kshetej Sareen.',
    },
  }
}

export default async function SpacesPage() {
  const server = await getCategoryServerData('spaces')
  return <KsCategoryPage data={spacesData} catId="spaces" {...server} />
}
