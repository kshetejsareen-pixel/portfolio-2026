import Link from 'next/link'
import { PortfolioCategory } from '@/lib/portfolio'

type CategoryPageProps = {
  category: PortfolioCategory
}

export function CategoryPage({ category }: CategoryPageProps) {
  return (
    <main className="space-y-24 pb-24 pt-16 lg:pb-32 lg:pt-24">
      <section className="max-w-6xl space-y-10 px-6 sm:px-8 lg:px-0">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-brand-muted">
          {category.hero.eyebrow}
        </div>
        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-brand-white sm:text-5xl">
            {category.hero.headline}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-brand-silver">
            {category.hero.lead}
          </p>
        </div>
      </section>

      <section className="grid gap-8 px-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-0">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_50px_100px_-80px_rgba(0,0,0,0.8)]">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Featured narratives</p>
            <h2 className="mt-6 text-3xl font-semibold text-white">A premium visual direction with clarity and calm.</h2>
            <p className="mt-4 text-base leading-8 text-brand-silver">
              Every frame is composed to feel editorial, intentional and inviting. The work supports brand storytelling while keeping the audience’s attention moving naturally.
            </p>
          </div>
          <div className="space-y-6">
            {category.works.map((work) => (
              <article
                key={work.title}
                style={{
                  backgroundImage: `radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 32%), radial-gradient(circle at bottom right, rgba(255,255,255,0.04), transparent 24%), linear-gradient(135deg, ${work.gradient})`,
                }}
                className="rounded-[2rem] border border-white/10 p-8 text-white transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                  {work.accent}
                </p>
                <h3 className="mt-5 text-2xl font-semibold">{work.title}</h3>
                <p className="mt-4 text-sm leading-7 text-brand-silver">{work.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_50px_100px_-80px_rgba(0,0,0,0.8)]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Why this work</p>
            <p className="text-base leading-8 text-brand-silver">
              The portfolio is built to feel premium at every touchpoint: rich tonal depth, structured hierarchy, and visuals that emphasise craftsmanship.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-muted">Next step</p>
            <p className="text-base leading-8 text-brand-white/80">
              Move from this portfolio into a tailored creative direction and production plan for your next brand campaign.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Return to studio home
          </Link>
        </div>
      </section>
    </main>
  )
}
