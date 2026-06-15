'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { CategoryData, FlowRow, FlowPhoto, IntroPart } from '@/lib/categoryData'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import { BrandMarquee } from '@/components/BrandMarquee'
import { PROJECT_TAGS } from '@/lib/tags'
import { LIFT, tx, SECTION, ITEM } from '@/lib/motionVariants'

const ALL_CATEGORIES = [
  { id: 'culinary',  name: 'Culinary' },
  { id: 'spaces',    name: 'Spaces' },
  { id: 'objects',   name: 'Objects' },
  { id: 'portraits', name: 'Portraits' },
  { id: 'motion',    name: 'Motion' },
]

// Glow cycle: 6s total, 4 items offset by 1.5s each.
// Delay formula puts item 0 at peak (50% of keyframe) immediately at mount.
function ExploreNav({ catId }: { catId: string }) {
  const links = [
    { id: '', name: 'Home' },
    ...ALL_CATEGORIES.filter(c => c.id !== catId),
  ]

  return (
    <nav className="cat-footer-nav">
      <div className="cat-footer-nav-inner">
        <div className="cat-footer-nav-eyebrow">Explore More</div>
        <div className="cat-footer-nav-cats">
          {links.map((c, i) => (
            <a
              key={c.id || 'home'}
              href={`/${c.id}`}
              className="cat-footer-nav-link"
              style={{ animationDelay: `${(i * 1.5 - 4.5).toFixed(1)}s` }}
            >
              {c.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

interface TextStyle {
  font?: 'serif' | 'mono' | 'sans'
  size?: number
  italic?: boolean
  bold?: boolean
}

interface CategoryCopy {
  introLabel?: string
  introBody?: string
  pullQuoteText?: string
  pullQuoteAttr?: string
  heroTitle?: string
  projectsSectionTitle?: string
  heroTitleStyle?: TextStyle
  introLabelStyle?: TextStyle
  introBodyStyle?: TextStyle
  pullQuoteStyle?: TextStyle
  pullQuoteAttrStyle?: TextStyle
}

const FONT_VAR: Record<NonNullable<TextStyle['font']>, string> = {
  serif: 'var(--font-serif)',
  mono:  'var(--font-mono)',
  sans:  'var(--font-sans)',
}

function textStyle(s?: TextStyle): React.CSSProperties {
  if (!s) return {}
  return {
    ...(s.font   ? { fontFamily:  FONT_VAR[s.font] }    : {}),
    ...(s.size   ? { fontSize:    `${s.size}px` }        : {}),
    ...(s.italic ? { fontStyle:   'italic' }              : { fontStyle: 'normal' }),
    ...(s.bold   ? { fontWeight:  '700' }                 : {}),
  }
}

interface AdminProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  imageCount?: number
  coverUrl?: string | null
  coverFocalX?: number
  coverFocalY?: number
  tags?: string[]
}

interface GalleryAssignment {
  url: string
  title: string
  location: string
  year: string
  camera: string
  focalX?: number
  focalY?: number
}

// Walks the flow in render order and overlays Cloudinary assignments onto each photo.
// Photo indices match gallery slot IDs: catId-0 → first photo, catId-1 → second, etc.
function applyGalleryAssignments(
  flow: FlowRow[],
  assignments: Record<string, GalleryAssignment>,
): FlowRow[] {
  let idx = 0

  function enrich(photo: FlowPhoto): FlowPhoto {
    const a = assignments[String(idx++)]
    if (!a) return photo
    return {
      ...photo,
      image:    a.url      || photo.image,
      title:    a.title    || photo.title,
      location: a.location || photo.location,
      year:     a.year     || photo.year,
      camera:   a.camera   || photo.camera,
      focalX:   a.focalX   ?? photo.focalX,
      focalY:   a.focalY   ?? photo.focalY,
    }
  }

  return flow.map((row) => {
    switch (row.kind) {
      case 'pull-quote':
        return row
      case 'full-bleed':
      case 'full-bleed-pano':
      case 'centered-tall':
      case 'offset':
        return { ...row, photo: enrich(row.photo) }
      case 'asym':
        return { ...row, large: enrich(row.large), smalls: row.smalls.map(enrich) }
      case 'three-up':
      case 'diptych':
      case 'duo':
        return { ...row, photos: row.photos.map(enrich) }
    }
  })
}

// Applies live focal-point overrides (from BroadcastChannel preview) keyed by slot index string.
function applyFocalOverrides(
  flow: FlowRow[],
  overrides: Record<string, { focalX: number; focalY: number }>,
): FlowRow[] {
  if (Object.keys(overrides).length === 0) return flow
  let idx = 0
  function override(photo: FlowPhoto): FlowPhoto {
    const o = overrides[String(idx++)]
    return o ? { ...photo, focalX: o.focalX, focalY: o.focalY } : photo
  }
  return flow.map((row) => {
    switch (row.kind) {
      case 'pull-quote': return row
      case 'full-bleed':
      case 'full-bleed-pano':
      case 'centered-tall':
      case 'offset': return { ...row, photo: override(row.photo) }
      case 'asym': return { ...row, large: override(row.large), smalls: row.smalls.map(override) }
      case 'three-up':
      case 'diptych':
      case 'duo': return { ...row, photos: row.photos.map(override) }
    }
  })
}

function photoHasImage(p: FlowPhoto) { return !!p.image }

// A row is "visible" if at least one photo in it has an assigned image.
// Pull-quotes are handled separately (shown only if any photos exist).
function rowHasAnyImage(row: FlowRow): boolean {
  switch (row.kind) {
    case 'pull-quote':   return false
    case 'asym':         return photoHasImage(row.large) || row.smalls.some(photoHasImage)
    case 'three-up':
    case 'diptych':
    case 'duo':          return row.photos.some(photoHasImage)
    default:             return photoHasImage(row.photo)
  }
}

function countAssigned(flow: FlowRow[]): number {
  return flow.reduce((n, row) => {
    switch (row.kind) {
      case 'pull-quote': return n
      case 'asym':       return n + (photoHasImage(row.large) ? 1 : 0) + row.smalls.filter(photoHasImage).length
      case 'three-up':
      case 'diptych':
      case 'duo':        return n + row.photos.filter(photoHasImage).length
      default:           return n + (photoHasImage(row.photo) ? 1 : 0)
    }
  }, 0)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function countPhotos(row: FlowRow): number {
  switch (row.kind) {
    case 'pull-quote': return 0
    case 'asym': return 1 + row.smalls.length
    case 'three-up':
    case 'diptych':
    case 'duo': return row.photos.length
    default: return 1
  }
}

function getHeroTint(row: FlowRow): string {
  if (row.kind === 'full-bleed' || row.kind === 'full-bleed-pano' ||
      row.kind === 'centered-tall' || row.kind === 'offset') return row.photo.tint
  if (row.kind === 'asym') return row.large.tint
  if (row.kind === 'three-up' || row.kind === 'diptych' || row.kind === 'duo') return row.photos[0].tint
  return '#1a1a1c'
}

function CatPhoto({ photo, aspectOverride }: { photo: FlowPhoto; aspectOverride?: string }) {
  const aspect = aspectOverride ? `cat-ar-${aspectOverride}` : `cat-ar-${photo.aspect}`
  return (
    <div className={`cat-photo ${aspect}`} style={{ backgroundColor: photo.tint }}>
      {photo.image
        ? <img
            src={photo.image}
            alt={photo.title}
            className="cat-photo-img"
            style={photo.focalX != null && photo.focalY != null
              ? { objectPosition: `${photo.focalX}% ${photo.focalY}%` }
              : undefined}
          />
        : <div className="cat-photo-ctr">{photo.title.toUpperCase()}</div>
      }
    </div>
  )
}

function CatCap({ photo, idx }: { photo: FlowPhoto; idx: number }) {
  const meta = [photo.location, photo.year].filter(Boolean).join(' · ')
  return (
    <div className="cat-cap">
      <span className="cat-cap-subj">{pad2(idx)}<span className="cat-cap-dot">·</span>{photo.title}</span>
      {meta && <span>{meta}</span>}
    </div>
  )
}

function CatPhotoWithCap({ photo, idx, aspectOverride }: { photo: FlowPhoto; idx: number; aspectOverride?: string }) {
  return (
    <div>
      <CatPhoto photo={photo} aspectOverride={aspectOverride} />
      <CatCap photo={photo} idx={idx} />
    </div>
  )
}

const ROW_VP = { once: false, amount: 0.1 } as const

function RowFullBleed({ row, idx }: { row: Extract<FlowRow, { kind: 'full-bleed' }>; idx: number }) {
  return (
    <motion.div className="cat-row cat-row-full-bleed"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <CatPhoto photo={row.photo} />
      <CatCap photo={row.photo} idx={idx} />
    </motion.div>
  )
}

function RowFullBleedPano({ row, idx }: { row: Extract<FlowRow, { kind: 'full-bleed-pano' }>; idx: number }) {
  return (
    <motion.div className="cat-row cat-row-full-bleed"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <CatPhoto photo={row.photo} aspectOverride="pano" />
      <CatCap photo={row.photo} idx={idx} />
    </motion.div>
  )
}

function RowAsym({ row, idxBase }: { row: Extract<FlowRow, { kind: 'asym' }>; idxBase: number }) {
  return (
    <motion.div className="cat-row cat-row-asym"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <div className="cat-contained">
        <div className="cat-row-asym-grid">
          <div className="cat-asym-item">
            <CatPhotoWithCap photo={row.large} idx={idxBase} />
          </div>
          <div className="cat-small-stack">
            {row.smalls.map((p, i) => (
              <div key={i} className="cat-asym-item">
                <CatPhotoWithCap photo={p} idx={idxBase + 1 + i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RowCenteredTall({ row, idx }: { row: Extract<FlowRow, { kind: 'centered-tall' }>; idx: number }) {
  return (
    <motion.div className="cat-row"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <div className="cat-contained">
        <div className="cat-row-ct-grid">
          <div className="cat-row-ct-side">
            <span className="cat-row-ct-num">{pad2(idx)}</span>
            {row.side?.text}
          </div>
          <CatPhotoWithCap photo={row.photo} idx={idx} />
          <div className="cat-row-ct-side" style={{ textAlign: 'right' }}>
            {row.photo.location}<br />{row.photo.year}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RowThreeUp({ row, idxBase }: { row: Extract<FlowRow, { kind: 'three-up' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-threeup">
      <div className="cat-contained">
        <motion.div className="cat-row-3up-grid"
          initial="hidden" whileInView="visible" viewport={ROW_VP} variants={SECTION}>
          {row.photos.map((p, i) => (
            <motion.div key={i} className="cat-multi-item" variants={ITEM}>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function RowDiptych({ row, idxBase }: { row: Extract<FlowRow, { kind: 'diptych' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-diptych">
      <div className="cat-contained">
        <motion.div className="cat-row-diptych-grid"
          initial="hidden" whileInView="visible" viewport={ROW_VP} variants={SECTION}>
          {row.photos.map((p, i) => (
            <motion.div key={i} className="cat-multi-item" variants={ITEM}>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function RowDuo({ row, idxBase }: { row: Extract<FlowRow, { kind: 'duo' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-duo">
      <div className="cat-contained">
        <motion.div className="cat-row-duo-grid"
          initial="hidden" whileInView="visible" viewport={ROW_VP} variants={SECTION}>
          {row.photos.map((p, i) => (
            <motion.div key={i} className="cat-multi-item" variants={ITEM}>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function RowOffset({ row, idx }: { row: Extract<FlowRow, { kind: 'offset' }>; idx: number }) {
  return (
    <motion.div className="cat-row"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <div className="cat-contained">
        <div className="cat-row-offset-grid">
          <div className="cat-row-offset-neg" />
          <CatPhotoWithCap photo={row.photo} idx={idx} />
        </div>
      </div>
      {row.text && (
        <div className="cat-row-offset-quote">
          <p className="cat-pull-quote-text">{row.text}</p>
        </div>
      )}
    </motion.div>
  )
}

function RowPullQuote({ pullQuote, copyOverride }: {
  pullQuote: { text: string; attr: string }
  copyOverride?: { text?: string; attr?: string; textStyle?: TextStyle; attrStyle?: TextStyle }
}) {
  return (
    <motion.div className="cat-row"
      initial={LIFT.initial} whileInView={LIFT.visible} viewport={ROW_VP} transition={tx()}>
      <div className="cat-pull-quote">
        <p className="cat-pull-quote-text" style={textStyle(copyOverride?.textStyle)}>{copyOverride?.text || pullQuote.text}</p>
        <div className="cat-pull-quote-attr" style={textStyle(copyOverride?.attrStyle)}>{copyOverride?.attr || pullQuote.attr}</div>
      </div>
    </motion.div>
  )
}

export function KsCategoryPage({ data, catId, videoGallery }: { data: CategoryData; catId: string; videoGallery?: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copy, setCopy] = useState<CategoryCopy>({})
  const [adminProjects, setAdminProjects] = useState<AdminProject[] | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [galleryAssignments, setGalleryAssignments] = useState<Record<string, GalleryAssignment>>({})
  const [heroAssignment, setHeroAssignment] = useState<{ url: string; focalX?: number; focalY?: number } | null>(null)
  const [focalOverrides, setFocalOverrides] = useState<Record<string, { focalX: number; focalY: number }>>({})

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const bc = new BroadcastChannel('ks-focal-preview')
    const prefix = `${catId}-`
    bc.onmessage = (e) => {
      if (!String(e.data.slotId).startsWith(prefix)) return
      const idx = String(e.data.slotId).slice(prefix.length)
      if (e.data.type === 'preview') {
        setFocalOverrides((prev) => ({ ...prev, [idx]: { focalX: e.data.focalX, focalY: e.data.focalY } }))
      } else if (e.data.type === 'cancel') {
        setFocalOverrides((prev) => { const n = { ...prev }; delete n[idx]; return n })
      }
    }
    return () => bc.close()
  }, [catId])

  const PROJECTS_INITIAL = 4

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/copy')
      .then((r) => r.json())
      .then((d) => { if (d.copy?.[catId]) setCopy(d.copy[catId]) })
      .catch(() => {})
  }, [catId])

  useEffect(() => {
    fetch(`/api/projects?catId=${catId}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.projects)) setAdminProjects(d.projects) })
      .catch(() => {})
  }, [catId])

  const fetchGallery = useCallback(() => {
    fetch(`/api/gallery?catId=${catId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.assignments) setGalleryAssignments(d.assignments)
        setHeroAssignment(d.hero ?? null)
      })
      .catch(() => {})
  }, [catId])

  useEffect(() => {
    fetchGallery()
    // Poll every 3s while visible so admin assignments appear without a manual refresh
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchGallery()
    }, 3000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchGallery() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchGallery])

  // Tags across admin projects
  const allTagIds = [...new Set((adminProjects ?? []).flatMap((p) => p.tags ?? []))]
  const filterTags = PROJECT_TAGS.filter((t) => allTagIds.includes(t.id))
  const filteredProjects = adminProjects
    ? (activeTag ? adminProjects.filter((p) => p.tags?.includes(activeTag)) : adminProjects)
    : null

  const enrichedFlow = applyFocalOverrides(
    applyGalleryAssignments(data.flow, galleryAssignments),
    focalOverrides,
  )

  const assignedCount = countAssigned(enrichedFlow)
  const anyAssigned   = assignedCount > 0
  const visibleFlow   = enrichedFlow

  const heroTint     = getHeroTint(visibleFlow[0] ?? enrichedFlow[0] ?? data.flow[0])

  const assignedYears = Object.values(galleryAssignments)
    .map((a) => parseInt(a.year, 10))
    .filter((y) => !isNaN(y))
  const yearRange = assignedYears.length > 0
    ? (() => {
        const min = Math.min(...assignedYears)
        const max = Math.max(...assignedYears)
        return min === max ? String(min) : `${min}–${max}`
      })()
    : null

  const YEAR_WORDS = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
                      'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Twenty']
  const yearSpanNum = assignedYears.length >= 2
    ? Math.max(...assignedYears) - Math.min(...assignedYears)
    : null
  const yearSpanWord = yearSpanNum !== null
    ? (yearSpanNum < YEAR_WORDS.length ? YEAR_WORDS[yearSpanNum] : String(yearSpanNum))
    : null
  const applyYearSpan = (s: string) =>
    yearSpanWord ? s.replace('{yearSpan}', yearSpanWord) : s.replace('{yearSpan}', 'Five')

  let photoIdx = 1
  const flowWithIdx = visibleFlow.map(row => {
    const start = photoIdx
    photoIdx += countPhotos(row)
    return { row, start }
  })

  return (
    <div className="ks-page-root">
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks" aria-label="Back to home">KS</Link>
          <span className="cat-tb-sep">/</span>
          <div className="cat-tb-crumb">
            <button className="cat-tb-cur" onClick={() => setMenuOpen(true)}>{data.cat.name}</button>
          </div>
        </div>
        <div className="cat-tb-right">
          <button onClick={() => setMenuOpen(true)}>Menu +</button>
        </div>
      </header>

      <section className="cat-hero" style={{ backgroundColor: heroTint }}>
        {heroAssignment && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroAssignment.url}
            alt=""
            className="cat-hero-photo"
            style={heroAssignment.focalX != null && heroAssignment.focalY != null
              ? { objectPosition: `${heroAssignment.focalX}% ${heroAssignment.focalY}%` }
              : undefined}
          />
        )}
        <div className="cat-hero-bg" />
        <div className="cat-hero-meta">
          <h1 className="cat-hero-title" style={textStyle(copy.heroTitleStyle)}>{copy.heroTitle || data.cat.name}</h1>
          <div className="cat-hero-lower">
            {yearRange && <div className="cat-hero-year">{yearRange}</div>}
            <div className="cat-scroll-hint">
              <span className="cat-scroll-hint-label">Scroll</span>
              <span className="cat-scroll-hint-arrow" />
            </div>
          </div>
        </div>
      </section>

      <motion.section className="cat-intro"
        initial={LIFT.initial} whileInView={LIFT.visible} viewport={{ once: false, amount: 0.2 }} transition={tx()}>
        <div className="cat-intro-label ks-eyebrow" style={textStyle(copy.introLabelStyle)}>{copy.introLabel || data.intro.label}</div>
        <p className="cat-intro-body" style={textStyle(copy.introBodyStyle)}>
          {copy.introBody
            ? applyYearSpan(copy.introBody)
            : data.intro.body.map((seg: IntroPart, i: number) =>
                typeof seg === 'string'
                  ? <span key={i}>{applyYearSpan(seg)}</span>
                  : <em key={i}>{(seg as { it: string }).it}</em>
              )
          }
        </p>
      </motion.section>

      {videoGallery ?? (anyAssigned && (
        <section className="cat-editorial">
          {flowWithIdx.map(({ row, start }, i) => {
            const key = `${row.kind}-${i}`
            switch (row.kind) {
              case 'full-bleed':
                return <RowFullBleed key={key} row={row} idx={start} />
              case 'full-bleed-pano':
                return <RowFullBleedPano key={key} row={row} idx={start} />
              case 'asym':
                return <RowAsym key={key} row={row} idxBase={start} />
              case 'centered-tall':
                return <RowCenteredTall key={key} row={row} idx={start} />
              case 'three-up':
                return <RowThreeUp key={key} row={row} idxBase={start} />
              case 'diptych':
                return <RowDiptych key={key} row={row} idxBase={start} />
              case 'duo':
                return <RowDuo key={key} row={row} idxBase={start} />
              case 'offset':
                return <RowOffset key={key} row={row} idx={start} />
              case 'pull-quote':
                return (
                  <RowPullQuote
                    key={key}
                    pullQuote={data.pullQuote}
                    copyOverride={{ text: copy.pullQuoteText, attr: copy.pullQuoteAttr, textStyle: copy.pullQuoteStyle, attrStyle: copy.pullQuoteAttrStyle }}
                  />
                )
              default:
                return null
            }
          })}
        </section>
      ))}

      <div className="cat-brand-strip"><BrandMarquee /></div>

      {adminProjects !== null && (filteredProjects ?? adminProjects).length > 0 && (
      <>
      <section className="cat-projects">
        <motion.header className="cat-projects-header"
          initial={LIFT.initial} whileInView={LIFT.visible} viewport={{ once: false, amount: 0.3 }} transition={tx()}>
          <h2 className="cat-projects-title">
            {copy.projectsSectionTitle || 'Selected Projects'}
          </h2>
          <p className="cat-projects-note">
            Bodies of work made over weeks or months. Full edits, contact sheets, and shoot notes.
          </p>
        </motion.header>

        {filterTags.length > 0 && (
          <div className="cat-tag-filter">
            <button
              className={`cat-tag-btn${activeTag === null ? ' active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {filterTags.map((t) => (
              <button
                key={t.id}
                className={`cat-tag-btn${activeTag === t.id ? ' active' : ''}`}
                style={{ '--tag-color': t.color } as React.CSSProperties}
                onClick={() => setActiveTag(activeTag === t.id ? null : t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {(() => {
          const source = filteredProjects ?? adminProjects ?? []
          const visible = showAllProjects ? source : source.slice(0, PROJECTS_INITIAL)
          const remaining = source.length - PROJECTS_INITIAL

          return (
            <>
              <motion.div className="cat-projects-grid"
                initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.05 }} variants={SECTION}>
                {visible.map((p) => (
                  <motion.a key={p.id} href={`/${catId}/projects/${p.id}`} className="cat-project" variants={ITEM}>
                    <div className="cat-project-cover">
                      <div className="cat-photo" style={{ backgroundColor: '#1a1a1c', width: '100%', height: '100%' }}>
                        {p.coverUrl
                          ? <img
                              src={p.coverUrl}
                              alt={p.title}
                              className="cat-photo-img"
                              style={p.coverFocalX != null && p.coverFocalY != null
                                ? { objectPosition: `${p.coverFocalX}% ${p.coverFocalY}%` }
                                : undefined}
                            />
                          : <div className="cat-photo-ctr">{p.title.toUpperCase()}</div>
                        }
                      </div>
                    </div>
                    {p.tags && p.tags.length > 0 && (
                      <div className="cat-project-tags">
                        {p.tags.map((tid) => {
                          const tag = PROJECT_TAGS.find((t) => t.id === tid)
                          return tag ? (
                            <span
                              key={tid}
                              className="cat-project-tag"
                              style={{ '--tag-color': tag.color } as React.CSSProperties}
                            >
                              {tag.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                    <div className="cat-project-info">
                      <div className="cat-project-info-top">
                        <h3 className="cat-project-title">
                          {p.title}{p.it && <em>, {p.it}</em>}
                        </h3>
                      </div>
                      <div className="cat-project-meta">
                        <span className="cat-project-yr">{p.year}</span>
                        <span>{p.location}</span>
                      </div>
                    </div>
                    {p.desc && <p className="cat-project-desc">{p.desc}</p>}
                  </motion.a>
                ))}
              </motion.div>

              {!showAllProjects && remaining > 0 && (
                <div className="cat-projects-more-wrap">
                  <button
                    className="cat-projects-more"
                    onClick={() => setShowAllProjects(true)}
                  >
                    View more projects
                  </button>
                </div>
              )}
            </>
          )
        })()}
      </section>
      </>)}

      <footer className="cat-footer">
        <ExploreNav catId={catId} />
        <div className="cat-footer-copy">
          <div>© Kshetej Sareen · 2026</div>
          <div>info@kshetejsareen.com</div>
        </div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
