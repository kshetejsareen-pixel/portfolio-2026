import { KsCategoryPage } from '@/components/KsCategoryPage'
import { motionData } from '@/lib/categoryData'

export const metadata = { title: 'Motion — Kshetej Sareen' }

export default function MotionPage() {
  return <KsCategoryPage data={motionData} catId="motion" />
}
