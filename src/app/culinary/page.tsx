import type { Metadata } from 'next'
import { KsCategoryPage } from '@/components/KsCategoryPage'
import { culinaryData } from '@/lib/categoryData'
import { getGalleryData, getCategoryOgImage } from '@/lib/getGalleryData'

const TITLE = 'Food Photography — Delhi & Bangalore | Kshetej Sareen'
const DESCRIPTION = 'Food and beverage photographer for restaurants, cafés and hospitality brands. Studios in New Delhi, Gurgaon and Bangalore; available in Hyderabad.'
const URL = 'https://www.kshetejsareen.com/culinary'

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getCategoryOgImage('culinary')
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
      description: 'Editorial food and beverage photography by Kshetej Sareen.',
    },
  }
}

export default async function CulinaryPage() {
  try {
    const initialGallery = await getGalleryData('culinary')
    return <KsCategoryPage data={culinaryData} catId="culinary" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={culinaryData} catId="culinary" />
  }
}
