import { KsCategoryPage } from '@/components/KsCategoryPage'
import { portraitsData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = {
  title: 'Portraits — Kshetej Sareen',
  description: 'Portrait photography by Kshetej Sareen. Studio and on-location portraits across New York and Bombay.',
  alternates: { canonical: 'https://www.kshetejsareen.com/portraits' },
  openGraph: {
    title: 'Portraits — Kshetej Sareen',
    description: 'Portrait photography by Kshetej Sareen. Studio and on-location portraits across New York and Bombay.',
    url: 'https://www.kshetejsareen.com/portraits',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Portraits — Kshetej Sareen',
    description: 'Portrait photography by Kshetej Sareen.',
  },
}

export default async function PortraitsPage() {
  try {
    const initialGallery = await getGalleryData('portraits')
    return <KsCategoryPage data={portraitsData} catId="portraits" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={portraitsData} catId="portraits" />
  }
}
