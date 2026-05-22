import Link from 'next/link'
import { categories } from '@/lib/portfolio'
import { PortfolioPreviewGrid } from '@/components/PortfolioPreviewGrid'

export const metadata = {
  title: 'Kshetej Sareen Studios — Premium Portfolio',
  description:
    'Luxury portfolio website for photography, showcasing F&B x Lifestyle, Interiors, Founder Portraits and Products.',
  openGraph: {
    title: 'Kshetej Sareen Studios — Premium Portfolio',
    description:
      'Luxury portfolio website for photography showing curated brand imagery across four categories.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="space-y-24 pb-24 pt-20 lg:pt-28">
      <section className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-0">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] xl:gap-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-brand-muted">
              Studio portfolio
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Photography built for premium hospitality, architecture, founders and product brands.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-silver">
                A curated portfolio of category-led imagery, designed to feel cinematic, editorial and exceptionally refined.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/food"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                Explore F&B x Lifestyle
              </Link>
              <Link
                href="/interiors"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                Explore Interiors
              </Link>
            </div>
          </div>
          <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_50px_100px_-80px_rgba(0,0,0,0.8)]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Designed to convert</p>
              <h2 className="text-3xl font-semibold text-white">A logical flow that guides attention.</h2>
              <p className="text-base leading-8 text-brand-silver">
                The homepage introduces the brand, then channels visitors into distinct category destinations with clear SEO-friendly paths.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#201C18]/80 via-[#0A0A0A]/80 to-[#0A0A0A]/100 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">Portfolio categories</p>
              <div className="mt-6 space-y-4">
                {categories.map((category) => (
                  <div key={category.slug} className="rounded-3xl border border-white/5 bg-black/20 p-4">
                    <h3 className="text-sm font-semibold text-white">{category.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-6 sm:px-8 lg:px-0">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Portfolio segments</p>
          <h2 className="text-3xl font-semibold text-white">Distinct categories, cohesive visual direction.</h2>
        </div>
        <PortfolioPreviewGrid />
      </section>
    </main>
  )
}
