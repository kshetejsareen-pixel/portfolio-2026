import { KsCategoryPage } from '@/components/KsCategoryPage'
import { objectsData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = {
  title: 'Objects — Kshetej Sareen',
  description: 'Still life and product photography by Kshetej Sareen. Objects photographed with intent.',
  alternates: { canonical: 'https://www.kshetejsareen.com/objects' },
  openGraph: {
    title: 'Objects — Kshetej Sareen',
    description: 'Still life and product photography by Kshetej Sareen. Objects photographed with intent.',
    url: 'https://www.kshetejsareen.com/objects',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Objects — Kshetej Sareen',
    description: 'Still life and product photography by Kshetej Sareen.',
  },
}

export default async function ObjectsPage() {
  try {
    const initialGallery = await getGalleryData('objects')
    return <KsCategoryPage data={objectsData} catId="objects" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={objectsData} catId="objects" />
  }
}
