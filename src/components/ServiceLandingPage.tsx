import Link from 'next/link'
import type { LandingPageDef } from '@/lib/landingPages'
import { relatedPages } from '@/lib/landingPages'
import type { GalleryData } from '@/lib/getGalleryData'

// Cloudinary URLs are built with w_2400; swap widths for a responsive set.
const SRCSET_WIDTHS = [800, 1200, 1600]

function srcSet(url: string): string | undefined {
  if (!url.includes('w_2400')) return undefined
  return SRCSET_WIDTHS.map((w) => `${url.replace('w_2400', `w_${w}`)} ${w}w`).join(', ')
}

export function ServiceLandingPage({
  def,
  gallery,
}: {
  def: LandingPageDef
  gallery: GalleryData | null
}) {
  const photos = gallery
    ? Object.keys(gallery.assignments)
        .sort((a, b) => Number(a) - Number(b))
        .slice(0, 4)
        .map((k) => gallery.assignments[k])
    : []

  const { sameServiceOtherCities, sameCityOtherServices } = relatedPages(def)

  return (
    <div className="svc-root">
      <header className="svc-topbar">
        <Link href="/" className="svc-ks">KS</Link>
        <nav className="svc-topnav">
          <Link href={def.catHref}>Portfolio</Link>
          <Link href="/info">Info</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main className="svc-main">
        <p className="svc-kicker">{def.serviceLabel} · {def.city}</p>
        <h1 className="svc-h1">{def.h1}</h1>
        <p className="svc-sub">{def.sub}</p>

        <div className="svc-intro">
          {def.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {photos.length > 0 && (
          <Link href={def.catHref} className="svc-strip" aria-label={def.catLabel}>
            {photos.map((p, i) => (
              <figure key={i} className="svc-strip-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  srcSet={srcSet(p.url)}
                  sizes="(max-width: 720px) 50vw, 25vw"
                  alt={p.title ? `${p.title} — ${def.serviceLabel.toLowerCase()} photography by Kshetej Sareen` : `${def.serviceLabel} photography by Kshetej Sareen`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </Link>
        )}
        <p className="svc-strip-caption">
          <Link href={def.catHref}>{def.catLabel} →</Link>
        </p>

        <section className="svc-section">
          <h2 className="svc-h2">Commissions include</h2>
          <ul className="svc-list">
            {def.include.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {def.clientsLine && <p className="svc-clients">{def.clientsLine}</p>}
        </section>

        <section className="svc-section">
          <h2 className="svc-h2">Questions, answered</h2>
          <dl className="svc-faq">
            {def.faqs.map((f, i) => (
              <div key={i} className="svc-faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="svc-cta">
          <h2 className="svc-h2">Commission an estimate</h2>
          <p>
            Write with your brief — venue, scope, timelines — and you will hear back with a
            considered, itemised estimate.
          </p>
          <p className="svc-cta-links">
            <a href="mailto:info@kshetejsareen.com">info@kshetejsareen.com</a>
            <span aria-hidden="true"> · </span>
            <Link href="/contact">Contact the studio</Link>
          </p>
        </section>

        <footer className="svc-footer">
          <div className="svc-related">
            <p className="svc-related-label">{def.serviceLabel} photography, elsewhere</p>
            <p>
              {sameServiceOtherCities.map((p, i) => (
                <span key={p.slug}>
                  {i > 0 && ' · '}
                  <Link href={`/${p.slug}`}>{p.city}</Link>
                </span>
              ))}
            </p>
            <p className="svc-related-label">Also in {def.city}</p>
            <p>
              {sameCityOtherServices.map((p, i) => (
                <span key={p.slug}>
                  {i > 0 && ' · '}
                  <Link href={`/${p.slug}`}>{p.serviceLabel}</Link>
                </span>
              ))}
            </p>
          </div>
          <p className="svc-copyright">© Kshetej Sareen · <Link href="/">kshetejsareen.com</Link></p>
        </footer>
      </main>
    </div>
  )
}
