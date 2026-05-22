import { CategoryPage } from '@/components/CategoryPage'
import { categoryMap } from '@/lib/portfolio'

const category = categoryMap.products

export const metadata = {
  title: 'Products — Kshetej Sareen Studios',
  description: category.seoDescription,
  openGraph: {
    title: 'Products — Kshetej Sareen Studios',
    description: category.seoDescription,
    type: 'website',
  },
}

export default function ProductsPage() {
  return <CategoryPage category={category} />
}
