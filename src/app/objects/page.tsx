import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { objectsData } from '@/lib/categoryData'
import { getGalleryData, getCategoryOgImage } from '@/lib/getGalleryData'

const TITLE = 'Product & Still Life Photography — Kshetej Sareen'
const DESCRIPTION = 'Product and still life photographer for campaigns, packaging and e-commerce. Studios in New Delhi, Gurgaon and Bangalore. Commissions include Tom Ford.'
const URL = 'https://www.kshetejsareen.com/objects'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getCategoryOgImage('objects')
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
      description: 'Still life and product photography by Kshetej Sareen.',
    },
  }
}

export default async function ObjectsPage() {
  try {
    const initialGallery = await getGalleryData('objects')
    return <KsCategoryPage data={objectsData} catId="objects" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={objectsData} catId="objects" />
  }
}
