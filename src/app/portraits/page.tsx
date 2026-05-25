import { KsCategoryPage } from '@/components/KsCategoryPage'
import { portraitsData } from '@/lib/categoryData'

export const metadata = { title: 'Portraits — Kshetej Sareen' }

export default function PortraitsPage() {
  return <KsCategoryPage data={portraitsData} catId="portraits" />
}
