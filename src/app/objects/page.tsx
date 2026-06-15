import { KsCategoryPage } from '@/components/KsCategoryPage'
import { objectsData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = { title: 'Objects — Kshetej Sareen' }

export default async function ObjectsPage() {
  try {
    const initialGallery = await getGalleryData('objects')
    return <KsCategoryPage data={objectsData} catId="objects" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={objectsData} catId="objects" />
  }
}
