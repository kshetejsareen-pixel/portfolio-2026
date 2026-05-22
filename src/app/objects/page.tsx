import { KsCategoryPage } from '@/components/KsCategoryPage'
import { objectsData } from '@/lib/categoryData'

export const metadata = { title: 'Objects — Kshetej Sareen' }

export default function ObjectsPage() {
  return <KsCategoryPage data={objectsData} />
}
