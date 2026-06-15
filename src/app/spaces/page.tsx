import { KsCategoryPage } from '@/components/KsCategoryPage'
import { spacesData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = { title: 'Spaces — Kshetej Sareen' }

export default async function SpacesPage() {
  try {
    const initialGallery = await getGalleryData('spaces')
    return <KsCategoryPage data={spacesData} catId="spaces" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={spacesData} catId="spaces" />
  }
}
