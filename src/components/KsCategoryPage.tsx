'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { CategoryData, FlowRow, FlowPhoto, IntroPart } from '@/lib/categoryData'
import type { GalleryData, GalleryAssignment } from '@/lib/getGalleryData'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import { BrandMarquee } from '@/components/BrandMarquee'
import { PROJECT_TAGS } from '@/lib/tags'

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
  heroOneliner?: string
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

function RowFullBleed({ row, idx }: { row: Extract<FlowRow, { kind: 'full-bleed' }>; idx: number }) {
  return (
    <div className="cat-row cat-row-full-bleed">
      <CatPhoto photo={row.photo} />
      <CatCap photo={row.photo} idx={idx} />
    </div>
  )
}

function RowFullBleedPano({ row, idx }: { row: Extract<FlowRow, { kind: 'full-bleed-pano' }>; idx: number }) {
  return (
    <div className="cat-row cat-row-full-bleed">
      <CatPhoto photo={row.photo} aspectOverride="pano" />
      <CatCap photo={row.photo} idx={idx} />
    </div>
  )
}

function RowAsym({ row, idxBase }: { row: Extract<FlowRow, { kind: 'asym' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-asym">
      <div className="cat-contained">
        <div className="cat-row-asym-grid">
          <div className="cat-asym-item" data-sr>
            <CatPhotoWithCap photo={row.large} idx={idxBase} />
          </div>
          <div className="cat-small-stack">
            {row.smalls.map((p, i) => (
              <div key={i} className="cat-asym-item" data-sr>
                <CatPhotoWithCap photo={p} idx={idxBase + 1 + i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RowCenteredTall({ row, idx }: { row: Extract<FlowRow, { kind: 'centered-tall' }>; idx: number }) {
  return (
    <div className="cat-row">
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
    </div>
  )
}

function RowThreeUp({ row, idxBase }: { row: Extract<FlowRow, { kind: 'three-up' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-threeup">
      <div className="cat-contained">
        <div className="cat-row-3up-grid">
          {row.photos.map((p, i) => (
            <div key={i} className="cat-multi-item" data-sr>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RowDiptych({ row, idxBase }: { row: Extract<FlowRow, { kind: 'diptych' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-diptych">
      <div className="cat-contained">
        <div className="cat-row-diptych-grid">
          {row.photos.map((p, i) => (
            <div key={i} className="cat-multi-item" data-sr>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RowDuo({ row, idxBase }: { row: Extract<FlowRow, { kind: 'duo' }>; idxBase: number }) {
  return (
    <div className="cat-row cat-row-duo">
      <div className="cat-contained">
        <div className="cat-row-duo-grid">
          {row.photos.map((p, i) => (
            <div key={i} className="cat-multi-item" data-sr>
              <CatPhotoWithCap photo={p} idx={idxBase + i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RowOffset({ row, idx }: { row: Extract<FlowRow, { kind: 'offset' }>; idx: number }) {
  return (
    <div className="cat-row">
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
    </div>
  )
}

function RowPullQuote({ pullQuote, copyOverride }: {
  pullQuote: { text: string; attr: string }
  copyOverride?: { text?: string; attr?: string; textStyle?: TextStyle; attrStyle?: TextStyle }
}) {
  return (
    <div className="cat-row">
      <div className="cat-pull-quote">
        <p className="cat-pull-quote-text" style={textStyle(copyOverride?.textStyle)}>{copyOverride?.text || pullQuote.text}</p>
        <div className="cat-pull-quote-attr" style={textStyle(copyOverride?.attrStyle)}>{copyOverride?.attr || pullQuote.attr}</div>
      </div>
    </div>
  )
}

// ─── BannerVideo ──────────────────────────────────────────────────────────────
// Uses the YT IFrame API (instead of a plain iframe src) so we can call
// mute() / unMute() after the player initialises.

let _bannerYTReady = false
const _bannerYTQueue: (() => void)[] = []

function flushBannerYTQueue() {
  _bannerYTReady = true
  _bannerYTQueue.forEach((cb) => cb())
  _bannerYTQueue.length = 0
}

function loadBannerYTAPI() {
  if (typeof window === 'undefined') return
  if (_bannerYTReady) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).YT?.Player) { flushBannerYTQueue(); return }
  // Always chain — even if the script was already added by MotionVideoGallery
  const prev = (window as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady
  ;(window as { onYouTubeIframeAPIReady: () => void }).onYouTubeIframeAPIReady = () => {
    prev?.()
    flushBannerYTQueue()
  }
  if (!document.getElementById('yt-iframe-api')) {
    const tag = document.createElement('script')
    tag.id = 'yt-iframe-api'
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }
}

function onBannerYTReady(cb: () => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (_bannerYTReady || (window as any).YT?.Player) { flushBannerYTQueue(); cb() }
  else _bannerYTQueue.push(cb)
}

function BannerVideo({ videoId }: { videoId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const [muted, setMuted] = useState(true)
  const playerId = `yt-banner-${videoId}`

  useEffect(() => {
    loadBannerYTAPI()
    const init = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).YT?.Player) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerRef.current = new (window as any).YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0,
          loop: 1, playlist: videoId,
          modestbranding: 1, rel: 0, playsinline: 1,
        },
      })
    }
    onBannerYTReady(init)
    return () => { playerRef.current?.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, playerId])

  const toggleMute = () => {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute?.(); setMuted(false) }
    else { playerRef.current.mute?.(); setMuted(true) }
  }

  return (
    <div className="cat-hero-video-wrap">
      <div id={playerId} className="cat-hero-video" />
      <button
        className={`cat-hero-mute-btn${muted ? '' : ' unmuted'}`}
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export function KsCategoryPage({ data, catId, videoGallery, initialGallery, bannerVideoId, yearRange: yearRangeProp }: { data: CategoryData; catId: string; videoGallery?: React.ReactNode; initialGallery?: GalleryData; bannerVideoId?: string; yearRange?: string | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copy, setCopy] = useState<CategoryCopy>({})
  const [adminProjects, setAdminProjects] = useState<AdminProject[] | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [galleryAssignments, setGalleryAssignments] = useState<Record<string, GalleryAssignment>>(() => initialGallery?.assignments ?? {})
  const [heroAssignment, setHeroAssignment] = useState<{ url: string; focalX?: number; focalY?: number } | null>(() => initialGallery?.hero ?? null)
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
  const computedYearRange = assignedYears.length > 0
    ? (() => {
        const min = Math.min(...assignedYears)
        const max = Math.max(...assignedYears)
        return min === max ? String(min) : `${min}–${max}`
      })()
    : null
  const yearRange = yearRangeProp ?? computedYearRange

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
        {bannerVideoId ? (
          <BannerVideo videoId={bannerVideoId} />
        ) : heroAssignment && (
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
          {copy.heroOneliner && (
            <p className="cat-hero-oneliner">{copy.heroOneliner}</p>
          )}
          <div className="cat-hero-lower">
            {yearRange && <div className="cat-hero-year">{yearRange}</div>}
            <div className="cat-scroll-hint">
              <span className="cat-scroll-hint-arrow" />
              <span className="cat-scroll-hint-label">Scroll</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-intro" data-sr>
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
      </section>

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
      <section className="cat-projects" data-sr>
        <header className="cat-projects-header">
          <h2 className="cat-projects-title">
            {copy.projectsSectionTitle || 'Selected Projects'}
          </h2>
          <p className="cat-projects-note">
            Bodies of work made over weeks or months. Full edits, contact sheets, and shoot notes.
          </p>
        </header>

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
              <div className="cat-projects-grid">
                {visible.map((p) => (
                  <a key={p.id} href={`/${catId}/projects/${p.id}`} className="cat-project">
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
                  </a>
                ))}
              </div>

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
