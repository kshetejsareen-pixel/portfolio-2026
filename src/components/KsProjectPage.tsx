'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import type { ProjectServerData } from '@/lib/projectServerData'

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

type Props = { catId: string; projectId: string } & ProjectServerData

export function KsProjectPage({ catId, projectId, initialProject, initialImages }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [project, setProject] = useState<ProjectData | null>(initialProject ?? null)
  const [images, setImages] = useState<CloudinaryImage[]>(initialImages ?? [])
  const [loading, setLoading] = useState(!initialImages)
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
        const p = Array.isArray(d.projects)
          ? (d.projects as ProjectData[]).find((x) => x.id === projectId)
          : undefined
        if (p) setProject(p)
        // The server already resolved this project; a failed refresh is no
        // reason to replace a rendered page with "Project not found".
        else if (!initialProject) setNotFound(true)
      })
      .catch(() => { if (!initialProject) setNotFound(true) })
  }, [catId, projectId, initialProject])

  useEffect(() => {
    if (!project) return
    // No setLoading(true) here: on the server-rendered page the frames are
    // already on screen, and re-entering the loading state would blank them.
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

      <footer className="proj-footer">
        <div className="cat-footer-copy">
          <div>© Kshetej Sareen · 2026</div>
          <div>info@kshetejsareen.com</div>
        </div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
