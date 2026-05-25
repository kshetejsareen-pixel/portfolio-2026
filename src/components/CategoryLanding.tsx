'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { categories, type Category, type Frame } from '@/lib/categories'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import { useNavigate } from '@/components/PageTransition'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const CATEGORY_ROUTES: Record<string, string> = {
  culinary:  '/culinary',
  spaces:    '/spaces',
  portraits: '/portraits',
  objects:   '/objects',
  motion:    '/motion',
}

const IDLE_DELAY    = 5000
const CYCLE_INTERVAL = 5000

interface LandingAssignment {
  url: string
  mobileUrl?: string
  title: string
  location: string
  year: string
  camera: string
  focalX?: number
  focalY?: number
}

// Build the active categories list from config + Cloudinary assignments.
// Cloudinary copy (ks_* context fields) takes precedence over static categories.ts data.
function buildCategories(
  config: Record<string, number>,
  assignments: Record<string, LandingAssignment>,
): Category[] {
  return categories.map((cat) => {
    const count = config[cat.id] ?? cat.frames.length
    const frames: Frame[] = Array.from({ length: count }, (_, i) => {
      const slotId = `landing-${cat.id}-${i}`
      const asgn   = assignments[slotId]
      const base   = cat.frames[i]
      return {
        title:       asgn?.title    || base?.title    || `Frame ${i + 1}`,
        location:    asgn?.location || base?.location || '',
        year:        asgn?.year     || base?.year     || '',
        camera:      asgn?.camera   || base?.camera   || '',
        image:       asgn?.url      ?? base?.image,
        mobileImage: asgn?.mobileUrl,
        focalX:      asgn?.focalX   ?? base?.focalX,
        focalY:      asgn?.focalY   ?? base?.focalY,
      }
    })
    return { ...cat, frames }
  })
}

export function CategoryLanding() {
  const navigate = useNavigate()
  const [catIdx, setCatIdx]   = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [focalOverrides, setFocalOverrides] = useState<Record<string, { focalX: number; focalY: number }>>({})

  useEffect(() => {
    const bc = new BroadcastChannel('ks-focal-preview')
    bc.onmessage = (e) => {
      if (e.data.type === 'preview') {
        setFocalOverrides((prev) => ({ ...prev, [e.data.slotId]: { focalX: e.data.focalX, focalY: e.data.focalY } }))
      } else if (e.data.type === 'cancel') {
        setFocalOverrides((prev) => { const n = { ...prev }; delete n[e.data.slotId]; return n })
      }
    }
    return () => bc.close()
  }, [])

  // Dynamic data from the admin panel
  const [activeCategories, setActiveCategories] = useState<Category[]>(categories)
  const cycleRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleRef       = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Refs so the interval callback always reads current values without stale closures
  const activeCatsRef = useRef(activeCategories)
  const catIdxRef     = useRef(0)
  const frameIdxRef   = useRef(0)
  useEffect(() => { activeCatsRef.current = activeCategories }, [activeCategories])
  useEffect(() => { catIdxRef.current   = catIdx   }, [catIdx])
  useEffect(() => { frameIdxRef.current = frameIdx }, [frameIdx])

  // Fetch config + assignments — polls every 3s while tab is visible for live admin preview
  const fetchLanding = useCallback(() => {
    fetch('/api/landing')
      .then((r) => r.json())
      .then(({ config, assignments }) => {
        setActiveCategories(buildCategories(config ?? {}, assignments ?? {}))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchLanding()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchLanding()
    }, 3000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchLanding() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchLanding])

  const cat = activeCategories[catIdx] ?? activeCategories[0]
  const frame = cat.frames[frameIdx] ?? cat.frames[0]
  const totalFrames = cat.frames.length


  // Reset frame index whenever the active category changes
  useEffect(() => { setFrameIdx(0) }, [catIdx])

  // ── Idle-cycle helpers ───────────────────────────────────────────────────
  const stopCycle = useCallback(() => {
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null }
    if (idleRef.current)  { clearTimeout(idleRef.current);  idleRef.current  = null }
  }, [])

  const startIdleCountdown = useCallback(() => {
    stopCycle()
    idleRef.current = setTimeout(() => {
      cycleRef.current = setInterval(() => {
        const cats       = activeCatsRef.current
        const ci         = catIdxRef.current
        const fi         = frameIdxRef.current
        const totalFrames = cats[ci]?.frames.length ?? 1

        if (fi < totalFrames - 1) {
          // More frames in this category — advance frame
          const next = fi + 1
          frameIdxRef.current = next
          setFrameIdx(next)
        } else {
          // All frames shown — move to next category
          const nextCat = (ci + 1) % cats.length
          catIdxRef.current   = nextCat
          frameIdxRef.current = 0
          setCatIdx(nextCat)
          setFrameIdx(0)
        }
      }, CYCLE_INTERVAL)
    }, IDLE_DELAY)
  }, [stopCycle])

  // Start the countdown on mount; clean up on unmount
  useEffect(() => {
    startIdleCountdown()
    return stopCycle
  }, [startIdleCountdown, stopCycle])

  // ── Keyboard navigation ──────────────────────────────────────────────────
  // Stops the cycle immediately on any keypress, then restarts the idle countdown.
  // Re-registers on catIdx change so `total` stays current.
  useEffect(() => {
    const total   = activeCategories[catIdx]?.frames.length ?? 1
    const catLen  = activeCategories.length
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
      e.preventDefault()
      stopCycle()
      if (e.key === 'ArrowRight') setFrameIdx((f) => (f + 1) % total)
      else if (e.key === 'ArrowLeft') setFrameIdx((f) => ((f - 1) + total) % total)
      else if (e.key === 'ArrowDown') setCatIdx((c) => (c + 1) % catLen)
      else if (e.key === 'ArrowUp')   setCatIdx((c) => ((c - 1) + catLen) % catLen)
      startIdleCountdown()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [catIdx, activeCategories, stopCycle, startIdleCountdown])

  // ── Category-strip click ─────────────────────────────────────────────────
  const handleCatClick = (i: number) => {
    if (i === catIdx) {
      const route = CATEGORY_ROUTES[activeCategories[i]?.id]
      if (route) navigate(route)
      return
    }
    stopCycle()
    setCatIdx(i)
    startIdleCountdown()
  }

  // ── Touch swipe ──────────────────────────────────────────────────────────
  // Stop cycle the moment the finger touches the screen so there's no race.
  const handleTouchStart = (e: React.TouchEvent) => {
    stopCycle()
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) >= 30) {
      if (absDx > absDy) {
        // Horizontal → step through frames
        if (dx < 0) setFrameIdx((f) => (f + 1) % totalFrames)
        else        setFrameIdx((f) => ((f - 1) + totalFrames) % totalFrames)
      } else {
        // Vertical → change category
        if (dy < 0) setCatIdx((c) => (c + 1) % activeCategories.length)
        else        setCatIdx((c) => ((c - 1) + activeCategories.length) % activeCategories.length)
      }
    }

    // Always restart the idle countdown after any touch interaction
    startIdleCountdown()
  }

  return (
    <div
      className="ks-stage"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Photo layers */}
      <div className="ks-photo-layer">
        {activeCategories.map((c, ci) =>
          c.frames.map((f, fi) => {
            const active = ci === catIdx && fi === frameIdx
            const slotId = `landing-${c.id}-${fi}`
            const override = focalOverrides[slotId]
            const focalX = override?.focalX ?? f.focalX
            const focalY = override?.focalY ?? f.focalY
            return (
              <div
                key={`${c.id}-${fi}`}
                className={`ks-frame${active ? ' active' : ''}`}
                style={{ backgroundColor: c.tint }}
                aria-hidden={!active}
              >
                {f.image
                  ? (
                    <picture>
                      {f.mobileImage && (
                        <source media="(max-width: 768px)" srcSet={f.mobileImage} />
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.image}
                        alt={f.title}
                        className="ks-frame-img"
                        style={focalX != null && focalY != null
                          ? { objectPosition: `${focalX}% ${focalY}%` }
                          : undefined}
                      />
                    </picture>
                  )
                  : active && (
                    <div className="ks-slot-tag">
                      {c.label.toUpperCase()} · DROP IMAGE — {f.title.toUpperCase()}
                    </div>
                  )
                }
              </div>
            )
          })
        )}
      </div>

      {/* Background category numeral */}
      <div className="ks-counter" aria-hidden="true">{cat.n}</div>

      {/* Cinemascope letterbox bars */}
      <div className="ks-letterbox ks-letterbox--top" />
      <div className="ks-letterbox ks-letterbox--bottom" />

      {/* Top bar */}
      <div className="ks-top-bar">
        <div className="ks-wordmark">
          <span className="ks-wordmark-ks">KS</span>
        </div>
        <nav className="ks-top-nav">
          <button className="ks-menu-btn" onClick={() => setMenuOpen(true)}>
            Menu +
          </button>
          <a href="/info">Info</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>

      {/* Category rail */}
      <div className="ks-cat-rail">
        {activeCategories.map((c, i) => (
          <button
            key={c.id}
            className={`ks-cat${i === catIdx ? ' active' : ''}`}
            onClick={() => handleCatClick(i)}
          >
            <span className="ks-cat-n">{c.n}</span>
            <span className="ks-cat-name">{c.label}</span>
            <span className="ks-cat-tick" />
          </button>
        ))}
      </div>


      {/* Step hints — desktop only */}
      {totalFrames > 1 && (
        <>
          <button
            className="ks-step-hint ks-step-hint--prev"
            onClick={() => setFrameIdx((f) => ((f - 1) + totalFrames) % totalFrames)}
            aria-label="Previous frame"
          >←</button>
          <button
            className="ks-step-hint ks-step-hint--next"
            onClick={() => setFrameIdx((f) => (f + 1) % totalFrames)}
            aria-label="Next frame"
          >→</button>
        </>
      )}

      {/* Meta block */}
      <div className="ks-meta">
        <div className="ks-meta-above">
          <span className="ks-dot" />
          <span className="ks-eyebrow">
            Featured — {cat.label} · {pad2(frameIdx + 1)} / {pad2(totalFrames)}
          </span>
          <a href={`/${cat.id}`} className="ks-eyebrow ks-open-cat">Open ↗</a>
        </div>
        <h1 className="ks-name">
          Kshetej<br /><span className="ks-name-last">Sareen</span>
        </h1>
        <div className="ks-subline">
          <div className="ks-subline-col">
            <strong>Independent photographer.</strong><br />New York · Bombay.
          </div>
          <div className="ks-subline-col">
            Available for commission and prints.<br />Booking — info@kshetejsareen.com
          </div>
        </div>
        {/* Inline slate — mobile only */}
        <div className="ks-slate ks-slate--inline">
          <div className="ks-slate-subj">{frame.title}</div>
          <div>{[frame.location, frame.year].filter(Boolean).join(' · ')}</div>
        </div>
      </div>

      {/* Slate — desktop bottom-right */}
      <div className="ks-slate ks-slate--desktop">
        <div className="ks-slate-subj">{frame.title}</div>
        <div>{[frame.location, frame.year].filter(Boolean).join(' · ')}</div>
        {frame.camera && <div>{frame.camera}</div>}
      </div>

      {/* Scrubber */}
      <div className="ks-scrubber" aria-hidden="true">
        <div
          className="ks-scrubber-fill"
          style={{ width: `${((frameIdx + 1) / totalFrames) * 100}%` }}
        />
      </div>

      {/* Footer corners — desktop only */}
      <div className="ks-footer-l">© Kshetej Sareen · MMXXVI</div>
      <div className="ks-footer-r">↑ ↓ Categories &nbsp;·&nbsp; ← → Frames</div>

      {/* Full-screen menu overlay */}
      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
