import { KsCategoryPage } from '@/components/KsCategoryPage'
import { culinaryData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = {
  title: 'Culinary — Kshetej Sareen',
  description: 'Editorial food and beverage photography by Kshetej Sareen. Studio and location work across India and New York.',
  alternates: { canonical: 'https://www.kshetejsareen.com/culinary' },
  openGraph: {
    title: 'Culinary — Kshetej Sareen',
    description: 'Editorial food and beverage photography by Kshetej Sareen. Studio and location work across India and New York.',
    url: 'https://www.kshetejsareen.com/culinary',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Culinary — Kshetej Sareen',
    description: 'Editorial food and beverage photography by Kshetej Sareen.',
  },
}

export default async function CulinaryPage() {
  try {
    const initialGallery = await getGalleryData('culinary')
    return <KsCategoryPage data={culinaryData} catId="culinary" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={culinaryData} catId="culinary" />
  }
}
