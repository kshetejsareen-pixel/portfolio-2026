import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { portraitsData } from '@/lib/categoryData'
import { getGalleryData, getCategoryOgImage } from '@/lib/getGalleryData'

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
  try {
    const initialGallery = await getGalleryData('portraits')
    return <KsCategoryPage data={portraitsData} catId="portraits" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={portraitsData} catId="portraits" />
  }
}
