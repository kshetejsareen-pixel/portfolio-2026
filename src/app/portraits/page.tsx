import { KsCategoryPage } from '@/components/KsCategoryPage'
import { portraitsData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = { title: 'Portraits — Kshetej Sareen' }

export default async function PortraitsPage() {
  try {
    const initialGallery = await getGalleryData('portraits')
    return <KsCategoryPage data={portraitsData} catId="portraits" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={portraitsData} catId="portraits" />
  }
}
