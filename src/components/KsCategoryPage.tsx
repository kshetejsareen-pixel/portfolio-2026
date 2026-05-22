'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { CategoryData, FlowRow, FlowPhoto, IntroPart } from '@/lib/categoryData'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'

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
        ? <img src={photo.image} alt={photo.subj} className="cat-photo-img" />
        : <div className="cat-photo-ctr">{photo.subj.toUpperCase()}</div>
      }
    </div>
  )
}

function CatCap({ photo, idx }: { photo: FlowPhoto; idx: number }) {
  return (
    <div className="cat-cap">
      <span className="cat-cap-subj">{pad2(idx)} · {photo.subj}</span>
      <span>{photo.loc} · {photo.yr}</span>
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
    <div className="cat-row">
      <div className="cat-contained">
        <div className="cat-row-asym-grid">
          <CatPhotoWithCap photo={row.large} idx={idxBase} />
          <div className="cat-small-stack">
            {row.smalls.map((p, i) => (
              <CatPhotoWithCap key={i} photo={p} idx={idxBase + 1 + i} />
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
            {row.photo.loc}<br />{row.photo.yr}
          </div>
        </div>
      </div>
    </div>
  )
}

function RowThreeUp({ row, idxBase }: { row: Extract<FlowRow, { kind: 'three-up' }>; idxBase: number }) {
  return (
    <div className="cat-row">
      <div className="cat-contained">
        <div className="cat-row-3up-grid">
          {row.photos.map((p, i) => (
            <CatPhotoWithCap key={i} photo={p} idx={idxBase + i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowDiptych({ row, idxBase }: { row: Extract<FlowRow, { kind: 'diptych' }>; idxBase: number }) {
  return (
    <div className="cat-row">
      <div className="cat-contained">
        <div className="cat-row-diptych-grid">
          {row.photos.map((p, i) => (
            <CatPhotoWithCap key={i} photo={p} idx={idxBase + i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowDuo({ row, idxBase }: { row: Extract<FlowRow, { kind: 'duo' }>; idxBase: number }) {
  return (
    <div className="cat-row">
      <div className="cat-contained">
        <div className="cat-row-duo-grid">
          {row.photos.map((p, i) => (
            <CatPhotoWithCap key={i} photo={p} idx={idxBase + i} />
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
          <div className="cat-row-offset-text">{row.text}</div>
        </div>
      </div>
    </div>
  )
}

function RowPullQuote({ pullQuote }: { pullQuote: { text: string; attr: string } }) {
  return (
    <div className="cat-row">
      <div className="cat-pull-quote">
        <p className="cat-pull-quote-text">{pullQuote.text}</p>
        <div className="cat-pull-quote-attr">{pullQuote.attr}</div>
      </div>
    </div>
  )
}

export function KsCategoryPage({ data }: { data: CategoryData }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroTint = getHeroTint(data.flow[0])
  const totalFrames = data.flow.reduce((n, r) => n + countPhotos(r), 0)

  let photoIdx = 1
  const flowWithIdx = data.flow.map(row => {
    const start = photoIdx
    photoIdx += countPhotos(row)
    return { row, start }
  })

  return (
    <>
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks" aria-label="Back to home">KS</Link>
          <div className="cat-tb-crumb">
            <Link href="/">Index</Link>
            <span>/</span>
            <span className="cat-tb-cur">{data.cat.n} · {data.cat.name}</span>
          </div>
        </div>
        <div className="cat-tb-right">
          <button onClick={() => setMenuOpen(true)}>Menu +</button>
        </div>
      </header>

      <section className="cat-hero" style={{ backgroundColor: heroTint }}>
        <div className="cat-hero-bg" />
        <div className="cat-hero-meta">
          <div className="cat-hero-eyebrow">
            <span className="ks-dot" />
            <span className="ks-eyebrow">Category · {data.cat.n} of 05</span>
          </div>
          <h1 className="cat-hero-title">{data.cat.name}</h1>
          <div className="cat-hero-stats">
            <span><strong>{totalFrames}</strong> Frames</span>
            <span><strong>{data.projects.length}</strong> Projects</span>
            <span><strong>2021–2026</strong></span>
          </div>
        </div>
        <div className="cat-scroll-hint">
          <span className="cat-scroll-hint-label">Scroll</span>
          <span className="cat-scroll-hint-arrow" />
        </div>
      </section>

      <section className="cat-intro">
        <div className="cat-intro-label ks-eyebrow">{data.intro.label}</div>
        <p className="cat-intro-body">
          {data.intro.body.map((seg: IntroPart, i: number) =>
            typeof seg === 'string'
              ? <span key={i}>{seg}</span>
              : <em key={i}>{(seg as { it: string }).it}</em>
          )}
        </p>
      </section>

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
              return <RowPullQuote key={key} pullQuote={data.pullQuote} />
            default:
              return null
          }
        })}
      </section>

      <section className="cat-projects">
        <header className="cat-projects-header">
          <h2 className="cat-projects-title">
            Selected<br />
            projects<span style={{ fontStyle: 'normal', color: 'var(--paper-dim)' }}>.</span>
          </h2>
          <p className="cat-projects-note">
            Bodies of work made over weeks or months. Full edits, contact sheets, and shoot notes.
          </p>
        </header>
        <div className="cat-projects-grid">
          {data.projects.map((p) => (
            <a key={p.id} className="cat-project">
              <div className="cat-project-cover">
                <div className="cat-photo" style={{ backgroundColor: p.tint, width: '100%', height: '100%' }}>
                  {p.image
                    ? <img src={p.image} alt={p.title} className="cat-photo-img" />
                    : <div className="cat-photo-ctr">{p.title.toUpperCase()}</div>
                  }
                </div>
              </div>
              <div className="cat-project-info">
                <h3 className="cat-project-title">
                  {p.title}{p.it && <em>, {p.it}</em>}
                </h3>
                <div className="cat-project-meta">
                  <span className="cat-project-yr">{p.yr}</span>
                  <span>{p.loc}</span><br />
                  <span>{p.count} frames</span>
                </div>
              </div>
              <p className="cat-project-desc">{p.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="cat-footer">
        <div>© Kshetej Sareen · MMXXVI</div>
        <div className="cat-footer-center"><Link href="/">↑ Back to index</Link></div>
        <div className="cat-footer-right">info@kshetejsareen.com</div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
