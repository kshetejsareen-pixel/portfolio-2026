import { CategoryPage } from '@/components/CategoryPage'
import { categoryMap } from '@/lib/portfolio'

const category = categoryMap.interiors

export const metadata = {
  title: 'Interiors & Architecture — Kshetej Sareen Studios',
  description: category.seoDescription,
  openGraph: {
    title: 'Interiors & Architecture — Kshetej Sareen Studios',
    description: category.seoDescription,
    type: 'website',
  },
}

export default function InteriorsPage() {
  return <CategoryPage category={category} />
}
