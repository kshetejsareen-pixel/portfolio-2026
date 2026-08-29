import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { portraitsData } from '@/lib/categoryData'
import { getCategoryOgImage } from '@/lib/getGalleryData'
import { getCategoryServerData } from '@/lib/categoryServerData'

// The page is prerendered, so the copy and project links baked into the HTML are
// what crawlers see. Regenerate hourly rather than only on deploy, matching the
// sitemap, so admin edits reach the index without a rebuild.
export const revalidate = 3600

const TITLE = 'Portrait & Corporate Headshot Photography — Kshetej Sareen'
const DESCRIPTION = 'Portrait, executive and corporate headshot photography in studio or on location across New Delhi, Gurgaon and Bangalore.'
const URL = 'https://www.kshetejsareen.com/portraits'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getCategoryOgImage('portraits')
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
      description: 'Portrait photography by Kshetej Sareen.',
    },
  }
}

export default async function PortraitsPage() {
  const server = await getCategoryServerData('portraits')
  return <KsCategoryPage data={portraitsData} catId="portraits" {...server} />
}
