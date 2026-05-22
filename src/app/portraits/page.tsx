import { CategoryPage } from '@/components/CategoryPage'
import { categoryMap } from '@/lib/portfolio'

const category = categoryMap.portraits

export const metadata = {
  title: 'Founder Portraits — Kshetej Sareen Studios',
  description: category.seoDescription,
  openGraph: {
    title: 'Founder Portraits — Kshetej Sareen Studios',
    description: category.seoDescription,
    type: 'website',
  },
}

export default function PortraitsPage() {
  return <CategoryPage category={category} />
}
