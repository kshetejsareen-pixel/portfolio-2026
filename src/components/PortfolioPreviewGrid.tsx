import { categories } from '@/lib/portfolio'
import { CategoryCard } from './CategoryCard'

export function PortfolioPreviewGrid() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {categories.map((item) => (
        <CategoryCard
          key={item.slug}
          label={item.label}
          description={item.description}
          href={`/${item.slug}`}
        />
      ))}
    </div>
  )
}
