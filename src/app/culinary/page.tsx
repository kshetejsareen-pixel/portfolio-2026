import { KsCategoryPage } from '@/components/KsCategoryPage'
import { culinaryData } from '@/lib/categoryData'

export const metadata = { title: 'Culinary — Kshetej Sareen' }

export default function CulinaryPage() {
  return <KsCategoryPage data={culinaryData} />
}
