import Link from 'next/link'

type CategoryCardProps = {
  label: string
  description: string
  href: string
}

export function CategoryCard({ label, description, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
    >
      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-brand-muted">
        {label}
      </p>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-brand-white">
        {description}
      </h3>
      <p className="mt-6 text-sm leading-7 text-brand-muted">
        View category work, case studies, and premium brand direction.
      </p>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white">
        Browse
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}
