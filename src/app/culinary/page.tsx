import { KsCategoryPage } from '@/components/KsCategoryPage'
import { culinaryData } from '@/lib/categoryData'
import { getGalleryData } from '@/lib/getGalleryData'

export const metadata = { title: 'Culinary — Kshetej Sareen' }

export default async function CulinaryPage() {
  try {
    const initialGallery = await getGalleryData('culinary')
    return <KsCategoryPage data={culinaryData} catId="culinary" initialGallery={initialGallery} />
  } catch {
    return <KsCategoryPage data={culinaryData} catId="culinary" />
  }
}
