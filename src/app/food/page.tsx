import { CategoryPage } from '@/components/CategoryPage'
import { categoryMap } from '@/lib/portfolio'

const category = categoryMap.food

export const metadata = {
  title: 'F&B x Lifestyle — Kshetej Sareen Studios',
  description: category.seoDescription,
  openGraph: {
    title: 'F&B x Lifestyle — Kshetej Sareen Studios',
    description: category.seoDescription,
    type: 'website',
  },
}

export default function FoodPage() {
  return <CategoryPage category={category} />
}
