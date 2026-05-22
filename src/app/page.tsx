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
    <main className="space-y-20 pb-24 pt-24 lg:pt-32">
      <section className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-0">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] xl:gap-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-brand-muted">
              welcome
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Choose the photography category that defines your brand.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-silver">
                Four premium creative directions, each with its own dedicated portfolio. Select the path you want to explore, and arrive directly at the work that matters.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/food"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                F&B x Lifestyle
              </Link>
              <Link
                href="/interiors"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                Interiors & Architecture
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_50px_100px_-80px_rgba(0,0,0,0.8)]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">How to begin</p>
              <h2 className="text-3xl font-semibold text-white">Start with your visual focus.</h2>
              <p className="text-base leading-8 text-brand-silver">
                Every category routes to a dedicated work segment. The website is built so the visitor’s decision instantly lands them in the right portfolio.
              </p>
            </div>
            <div className="mt-10 grid gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="block rounded-3xl border border-white/10 bg-black/10 px-5 py-5 transition hover:border-white/20 hover:bg-white/5"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">{category.label}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{category.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-silver">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-0">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-[0_50px_120px_-100px_rgba(0,0,0,0.8)]">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Your next move</p>
              <h2 className="text-3xl font-semibold text-white">A premium portfolio direction with clarity and ease.</h2>
              <p className="text-base leading-8 text-brand-silver">
                The homepage serves as the decision point — once a category is selected, the visitor is taken to a dedicated segment with focused messaging, visuals and work examples.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/portraits"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">Founder portraits</p>
                <p className="mt-3 text-sm leading-7 text-brand-silver">
                  Designed for founders and leaders who need imagery with authority and nuance.
                </p>
              </Link>
              <Link
                href="/products"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">Products</p>
                <p className="mt-3 text-sm leading-7 text-brand-silver">
                  Luxury product imagery crafted for brands, launches and editorial commerce.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
