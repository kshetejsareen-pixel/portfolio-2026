'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'

interface ProjectData {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  coverFocalX?: number
  coverFocalY?: number
  coverUrl?: string | null
  imageCount?: number
  tags?: string[]
  hiddenImages?: string[]
}

interface CloudinaryImage {
  public_id: string
  secure_url: string
  width: number
  height: number
}

const CLOUD = 'dsouvrzlr'

function galleryUrl(img: CloudinaryImage): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_1400/${img.public_id}`
}

export function KsProjectPage({ catId, projectId }: { catId: string; projectId: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const catLabel = catId.charAt(0).toUpperCase() + catId.slice(1)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch(`/api/projects?catId=${catId}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.projects)) {
          const p = (d.projects as ProjectData[]).find((x) => x.id === projectId)
          if (p) setProject(p)
          else setNotFound(true)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
  }, [catId, projectId])

  useEffect(() => {
    if (!project) return
    setLoading(true)
    fetch(`/api/project-images?folder=${encodeURIComponent(project.folder)}`)
      .then((r) => r.json())
      .then((d) => {
        const hidden = new Set(project.hiddenImages ?? [])
        const visible = (d.images as CloudinaryImage[] ?? []).filter(
          (img) => !hidden.has(img.public_id),
        )
        setImages(visible)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [project])

  const heroUrl = project?.coverId
    ? `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_2400/${project.coverId}`
    : project?.coverUrl ?? null

  if (notFound) {
    return (
      <div className="proj-not-found">
        <p>Project not found.</p>
        <Link href={`/${catId}`}>← Back to {catLabel}</Link>
      </div>
    )
  }

  return (
    <div className="ks-page-root">
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks" aria-label="Back to home">KS</Link>
          <div className="cat-tb-crumb">
            <Link href="/">Index</Link>
            <span>/</span>
            <Link href={`/${catId}`}>{catLabel}</Link>
            <span>/</span>
            <span className="cat-tb-cur">{project?.title ?? '…'}</span>
          </div>
        </div>
        <div className="cat-tb-right">
          <button onClick={() => setMenuOpen(true)}>Menu +</button>
        </div>
      </header>

      <section className="proj-hero" style={!heroUrl ? { backgroundColor: '#1a1a1c' } : undefined}>
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt=""
            className="proj-hero-img"
            style={project?.coverFocalX != null && project?.coverFocalY != null
              ? { objectPosition: `${project.coverFocalX}% ${project.coverFocalY}%` }
              : undefined}
          />
        )}
        <div className="proj-hero-bg" />
        <div className="proj-hero-meta">
          <div className="proj-hero-eyebrow">
            <span className="ks-dot" />
            <span className="ks-eyebrow">{catLabel} · Project</span>
          </div>
          <h1 className="proj-hero-title">
            {project?.title ?? <span style={{ opacity: 0.3 }}>Loading…</span>}
            {project?.it && <em>, {project.it}</em>}
          </h1>
          <div className="proj-hero-stats">
            {project?.year && <span>{project.year}</span>}
            {project?.location && <span>{project.location}</span>}
            {!loading && <span><strong>{images.length}</strong> frames</span>}
          </div>
        </div>
      </section>

      {project?.desc && (
        <section className="proj-intro" data-sr>
          <p className="proj-intro-body">{project.desc}</p>
        </section>
      )}

      <section className="proj-gallery" data-sr>
        {loading ? (
          <div className="proj-gallery-loading">Loading…</div>
        ) : images.length === 0 ? (
          <div className="proj-gallery-loading">No images in this project.</div>
        ) : (
          <div className="proj-gallery-grid">
            {([images.filter((_, i) => i % 2 === 0), images.filter((_, i) => i % 2 === 1)] as const).map((col, c) => (
              <div key={c} className="proj-gallery-col">
                {col.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.public_id}
                    src={galleryUrl(img)}
                    alt={`${project?.title ?? ''} ${c === 0 ? i * 2 + 1 : i * 2 + 2}`}
                    className="proj-gallery-img"
                    loading={i < 2 && c < 2 ? 'eager' : 'lazy'}
                    onLoad={(e) => e.currentTarget.classList.add('loaded')}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="cat-footer">
        <div>© Kshetej Sareen · MMXXVI</div>
        <div className="cat-footer-center">
          <Link href={`/${catId}`}>↑ Back to {catLabel}</Link>
        </div>
        <div className="cat-footer-right">info@kshetejsareen.com</div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
