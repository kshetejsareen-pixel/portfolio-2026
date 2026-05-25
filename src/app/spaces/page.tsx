import { KsCategoryPage } from '@/components/KsCategoryPage'
import { spacesData } from '@/lib/categoryData'

export const metadata = { title: 'Spaces — Kshetej Sareen' }

export default function SpacesPage() {
  return <KsCategoryPage data={spacesData} catId="spaces" />
}
