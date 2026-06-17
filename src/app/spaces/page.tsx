import { KsCategoryPage } from '@/components/KsCategoryPage'
import { spacesData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = {
  title: 'Spaces — Kshetej Sareen',
  description: 'Interior and architectural photography by Kshetej Sareen. Quiet spaces, considered light.',
  alternates: { canonical: 'https://www.kshetejsareen.com/spaces' },
  openGraph: {
    title: 'Spaces — Kshetej Sareen',
    description: 'Interior and architectural photography by Kshetej Sareen. Quiet spaces, considered light.',
    url: 'https://www.kshetejsareen.com/spaces',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Spaces — Kshetej Sareen',
    description: 'Interior and architectural photography by Kshetej Sareen.',
  },
}

export default async function SpacesPage() {
  try {
    const initialGallery = await getGalleryData('spaces')
    return <KsCategoryPage data={spacesData} catId="spaces" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={spacesData} catId="spaces" />
  }
}
