'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { categories, type Category, type Frame } from '@/lib/categories'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import { BrandMarquee } from '@/components/BrandMarquee'
import { useNavigate } from '@/components/PageTransition'
import type { LandingData, LandingAssignment } from '@/lib/getLandingData'
import type { MotionVideo } from '@/lib/motionVideos'

interface TextStyle {
  font?: 'serif' | 'mono' | 'sans'
  size?: number
  italic?: boolean
  bold?: boolean
}

function textStyle(s?: TextStyle): React.CSSProperties {
  return {
    fontFamily: s?.font === 'serif' ? 'var(--font-serif)' : s?.font === 'mono' ? 'var(--font-mono)' : s?.font === 'sans' ? 'var(--font-sans)' : undefined,
    fontSize:   s?.size != null ? `${s.size}px` : undefined,
    fontStyle:  s?.italic ? 'italic' : undefined,
    fontWeight: s?.bold ? '700' : undefined,
  }
}

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

const IDLE_DELAY     = 3000
const FIRST_INTERVAL = 3000
const CYCLE_INTERVAL = 4000

// Build the active categories list from config + assignments, sorted by stored order.
function buildCategories(
  config: Record<string, number>,
  assignments: Record<string, LandingAssignment>,
  order: string[],
): Category[] {
  const sorted = order.length
    ? [...categories].sort((a, b) => {
        const ai = order.indexOf(a.id)
        const bi = order.indexOf(b.id)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    : categories

  return sorted.map((cat) => {
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

interface LandingCopy {
  tickerStatus?: string
  tickerLeadTime?: string
  tickerStatusStyle?: TextStyle
  tickerLeadTimeStyle?: TextStyle
  tagline?: string
  taglineStyle?: TextStyle
}

export function CategoryLanding({ initialData, initialCopy }: { initialData?: LandingData; initialCopy?: LandingCopy }) {
  const navigate = useNavigate()
  const [globalIdx, setGlobalIdx] = useState(0)
  const [scrubDuration, setScrubDuration] = useState(FIRST_INTERVAL)
  const [menuOpen, setMenuOpen] = useState(false)
  const [focalOverrides, setFocalOverrides] = useState<Record<string, { focalX: number; focalY: number }>>({})
  const [showNavHint, setShowNavHint] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef  = useRef<HTMLDivElement>(null)

  // Prevent iOS Safari pull-to-refresh on the fixed stage.
  // overscroll-behavior:none in CSS covers Chrome/Android; this covers Safari
  // (requires passive:false so preventDefault() is actually honoured).
  // Our swipe detection uses touchstart/touchend only, so nothing breaks.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const block = (e: TouchEvent) => e.preventDefault()
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COUNT = 55
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 1.4,
      speed: 0.00008 + Math.random() * 0.00012,
      angle: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.0003,
      opacity: 0.04 + Math.random() * 0.06,
    }))

    let w = 0, h = 0, raf = 0

    function resize() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      w = canvas.width
      h = canvas.height
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.angle += p.drift
        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed * 0.6
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(236, 232, 224, ${p.opacity})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  // Show directional swipe hint once ever (localStorage, survives hard reloads)
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    if (localStorage.getItem('ks-nav-hinted')) return
    setShowNavHint(true)
    localStorage.setItem('ks-nav-hinted', '1')
    const t = setTimeout(() => setShowNavHint(false), 4000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
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

  // Dynamic data from the admin panel — seeded with server-fetched data to avoid placeholder flash
  const [activeCategories, setActiveCategories] = useState<Category[]>(() =>
    initialData
      ? buildCategories(initialData.config, initialData.assignments, initialData.categoryOrder)
      : categories
  )
  const [tickerStatus,      setTickerStatus]      = useState(initialCopy?.tickerStatus      ?? 'Open for bookings — May through Sept 2026')
  const [tickerLeadTime,    setTickerLeadTime]    = useState(initialCopy?.tickerLeadTime    ?? 'Lead time · 3–6 weeks')
  const [tickerStatusStyle, setTickerStatusStyle] = useState<TextStyle | undefined>(initialCopy?.tickerStatusStyle)
  const [tickerLeadStyle,   setTickerLeadStyle]   = useState<TextStyle | undefined>(initialCopy?.tickerLeadTimeStyle)
  const [tagline,           setTagline]           = useState(initialCopy?.tagline           ?? '')
  const [taglineStyle,      setTaglineStyle]      = useState<TextStyle | undefined>(initialCopy?.taglineStyle)
  const [motionVideos,   setMotionVideos]   = useState<MotionVideo[]>([])
  const motionVideosRef = useRef<MotionVideo[]>([])
  const cycleRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleRef       = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Cap motion frame count to available videos so empty slots never enter the cycle.
  // Exclude motion entirely until videos load — the empty-array initial state would
  // otherwise let uncapped frame slots cycle with no content.
  const displayCategories = useMemo(() => {
    if (motionVideos.length === 0) {
      return activeCategories.filter(cat => cat.id !== 'motion')
    }
    return activeCategories.map((cat) =>
      cat.id !== 'motion' ? cat : { ...cat, frames: cat.frames.slice(0, motionVideos.length) }
    )
  }, [activeCategories, motionVideos])

  // Refs so the interval callback always reads current values without stale closures
  const activeCatsRef = useRef(displayCategories)
  const globalIdxRef  = useRef(0)
  useEffect(() => { activeCatsRef.current = displayCategories }, [displayCategories])
  useEffect(() => { globalIdxRef.current = globalIdx }, [globalIdx])
  useEffect(() => { motionVideosRef.current = motionVideos }, [motionVideos])

  // Returns the display duration for a given global index — 5s for motion video frames, 3s otherwise
  const getFrameInterval = useCallback((g: number) => {
    const n = activeCatsRef.current.length || 1
    const ci = g % n
    const cat = activeCatsRef.current[ci]
    const fi = Math.floor(g / n) % (cat?.frames?.length || 1)
    const isMotionVideo = cat?.id === 'motion' && motionVideosRef.current.length > fi
    return isMotionVideo ? 5000 : CYCLE_INTERVAL
  }, [])

  // Fetch config + assignments — polls every 3s while tab is visible for live admin preview
  const fetchLanding = useCallback(() => {
    fetch('/api/landing')
      .then((r) => r.json())
      .then(({ config, assignments, categoryOrder }) => {
        setActiveCategories(buildCategories(config ?? {}, assignments ?? {}, categoryOrder ?? []))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/copy')
      .then((r) => r.json())
      .then((d) => {
        const land    = d.copy?.landing ?? {}
        const contact = d.copy?.contact ?? {}
        // landing-specific values take precedence over contact fallbacks
        if (land.tickerStatus   || contact.tickerStatus)   setTickerStatus(land.tickerStatus   ?? contact.tickerStatus)
        if (land.tickerLeadTime || contact.tickerLeadTime) setTickerLeadTime(land.tickerLeadTime ?? contact.tickerLeadTime)
        if (land.tickerStatusStyle)  setTickerStatusStyle(land.tickerStatusStyle)
        if (land.tickerLeadTimeStyle) setTickerLeadStyle(land.tickerLeadTimeStyle)
        if (land.tagline)      setTagline(land.tagline)
        if (land.taglineStyle) setTaglineStyle(land.taglineStyle)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/motion-videos')
      .then((r) => r.json())
      .then((d) => {
        // Banner plays first, then uploaded videos in their motion-page order
        const seq: MotionVideo[] = []
        if (d.bannerVideoId) seq.push({ id: 'banner', youtubeId: d.bannerVideoId, title: 'Motion reel', isShort: false })
        if (Array.isArray(d.videos)) seq.push(...d.videos)
        setMotionVideos(seq)
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

  const numCats = displayCategories.length || 1
  const catIdx = globalIdx % numCats
  const cat = displayCategories[catIdx] ?? displayCategories[0]
  const totalFrames = cat.frames.length || 1
  const frameForDisplay = Math.floor(globalIdx / numCats) % totalFrames
  const frame = cat.frames[frameForDisplay] ?? cat.frames[0]

  // Only mount <img> tags for frames that have been shown — prevents iOS Safari
  // from downloading all 17+ full-res images at once and crashing the tab.
  const [loadedSlots, setLoadedSlots] = useState<Set<string>>(
    () => new Set([`${categories[0]?.id ?? ''}-0`])
  )
  useEffect(() => {
    // Add current slot and preload next so the upcoming transition is smooth
    const nextG   = globalIdx + 1
    const nextCi  = nextG % numCats
    const nextCat = displayCategories[nextCi]
    const nextFi  = nextCat ? Math.floor(nextG / numCats) % (nextCat.frames.length || 1) : 0
    setLoadedSlots((prev) => {
      const s = new Set(prev)
      s.add(`${cat.id}-${frameForDisplay}`)
      if (nextCat) s.add(`${nextCat.id}-${nextFi}`)
      return s
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalIdx])

  // ── Idle-cycle helpers ───────────────────────────────────────────────────
  const stopCycle = useCallback(() => {
    if (cycleRef.current) { clearTimeout(cycleRef.current); cycleRef.current = null }
    if (idleRef.current)  { clearTimeout(idleRef.current);  idleRef.current  = null }
  }, [])

  const startIdleCountdown = useCallback(() => {
    stopCycle()
    setScrubDuration(IDLE_DELAY + CYCLE_INTERVAL)
    idleRef.current = setTimeout(() => {
      const tick = () => {
        const g = globalIdxRef.current + 1
        globalIdxRef.current = g
        setGlobalIdx(g)
        const delay = getFrameInterval(g)
        setScrubDuration(delay)
        cycleRef.current = setTimeout(tick, delay)
      }
      tick()
    }, IDLE_DELAY)
  }, [stopCycle, getFrameInterval])

  const startAutoPlay = useCallback(() => {
    stopCycle()
    const tick = () => {
      const g = globalIdxRef.current + 1
      globalIdxRef.current = g
      setGlobalIdx(g)
      const delay = getFrameInterval(g)
      setScrubDuration(delay)
      cycleRef.current = setTimeout(tick, delay)
    }
    const firstDelay = FIRST_INTERVAL
    setScrubDuration(firstDelay)
    idleRef.current = setTimeout(() => {
      idleRef.current = null
      tick()
    }, firstDelay)
  }, [stopCycle, getFrameInterval])

  useEffect(() => {
    startAutoPlay()
    return stopCycle
  }, [startAutoPlay, stopCycle])

  // ── Keyboard navigation ──────────────────────────────────────────────────
  // ↑ / ↓  → change category   (no frame change)
  // ← / →  → change frame within current category
  // Reads from refs so the listener never needs to re-register on state changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
      e.preventDefault()
      stopCycle()

      const g = globalIdxRef.current
      const n = activeCatsRef.current.length || 1

      if      (e.key === 'ArrowDown')  setGlobalIdx(g + 1)
      else if (e.key === 'ArrowUp')    setGlobalIdx(Math.max(0, g - 1))
      else if (e.key === 'ArrowRight') setGlobalIdx(g + n)
      else if (e.key === 'ArrowLeft')  setGlobalIdx(Math.max(0, g - n))

      startIdleCountdown()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stopCycle, startIdleCountdown])

  // ── Category-strip click ─────────────────────────────────────────────────
  const handleCatClick = (i: number) => {
    if (i === catIdx) {
      const route = CATEGORY_ROUTES[displayCategories[i]?.id]
      if (route) navigate(route)
      return
    }
    stopCycle()
    const g = globalIdxRef.current
    const n = activeCatsRef.current.length || 1
    setGlobalIdx(Math.floor(g / n) * n + i)
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

    if (Math.max(absDx, absDy) < 30) {
      startIdleCountdown()
      return
    }

    const g = globalIdxRef.current
    const n = activeCatsRef.current.length || 1

    if (absDx >= absDy) {
      // Horizontal swipe → frame jump within same category (mirrors ← → keys)
      if (dx < 0) setGlobalIdx(g + n)
      else        setGlobalIdx(Math.max(0, g - n))
    } else {
      // Vertical swipe → round-robin through sequence (mirrors ↑ ↓ keys)
      if (dy < 0) setGlobalIdx(g + 1)
      else        setGlobalIdx(Math.max(0, g - 1))
    }

    startIdleCountdown()
  }

  // iOS Safari: touchmove with preventDefault() can cause the touch to end as
  // 'touchcancel' instead of 'touchend', leaving the cycle stopped permanently.
  const handleTouchCancel = () => {
    touchStartRef.current = null
    startIdleCountdown()
  }

  return (
    <div
      ref={stageRef}
      className="ks-stage"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Effect 3 — ambient particles */}
      <canvas ref={canvasRef} className="ks-particles" aria-hidden="true" />

      {/* Photo layers */}
      <div className="ks-photo-layer">
        {displayCategories.map((c, ci) =>
          c.frames.map((f, fi) => {
            const active = ci === catIdx && fi === frameForDisplay
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
                {c.id === 'motion' && motionVideos[fi] && active ? (
                  /* Inactive motion frames render nothing — the frame div fades out
                     via CSS opacity so there is no thumbnail flash on transition */
                  <div className="ks-frame-video-wrap">
                    <iframe
                      key={motionVideos[fi].youtubeId}
                      className="ks-frame-video"
                      src={`https://www.youtube.com/embed/${motionVideos[fi].youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${motionVideos[fi].youtubeId}&modestbranding=1&rel=0&playsinline=1`}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={motionVideos[fi].title}
                    />
                  </div>
                ) : c.id !== 'motion' && f.image && loadedSlots.has(`${c.id}-${fi}`)
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
                  : active && !f.image && c.id !== 'motion' && (
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

      {/* Background category numeral — dims over cycle, snaps on change */}
      <div className="ks-counter-wrap" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={catIdx}
            className="ks-counter"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: -80, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 0.1, 0, 1] }}
          >
            <span
              className="ks-counter-dim"
              style={{ animationDuration: `${scrubDuration}ms` }}
            >
              {pad2(catIdx + 1)}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Cinemascope letterbox bars */}
      <div className="ks-letterbox ks-letterbox--top" />
      <div className="ks-letterbox ks-letterbox--bottom" />

      {/* Availability ticker */}
      <div className="ks-avail-ticker" aria-label="Studio availability">
        <span className="ks-avail-ticker-left" style={textStyle(tickerStatusStyle)}>
          <span className="ks-avail-dot" aria-hidden="true" />
          {tickerStatus}
        </span>
        <span className="ks-avail-ticker-right" style={textStyle(tickerLeadStyle)}>{tickerLeadTime}</span>
      </div>

      {/* Top bar */}
      <div className="ks-top-bar">
        <div className="ks-wordmark">
          <span className="ks-wordmark-ks">KS</span>
          {tagline && <span className="ks-wordmark-tagline" style={textStyle(taglineStyle)}>{tagline}</span>}
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
        {displayCategories.map((c, i) => (
          <button
            key={c.id}
            className={`ks-cat${i === catIdx ? ' active' : ''}`}
            onClick={() => handleCatClick(i)}
          >
            <span className="ks-cat-n">{pad2(i + 1)}</span>
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
            onClick={() => { const g = globalIdxRef.current; const n = activeCatsRef.current.length || 1; setGlobalIdx(Math.max(0, g - n)) }}
            aria-label="Previous frame"
          >←</button>
          <button
            className="ks-step-hint ks-step-hint--next"
            onClick={() => { const g = globalIdxRef.current; const n = activeCatsRef.current.length || 1; setGlobalIdx(g + n) }}
            aria-label="Next frame"
          >→</button>
        </>
      )}

      {/* Vertical category-indicator dots — left edge, mirrors cat rail */}
      <div className="ks-nav-dots-y" aria-hidden="true">
        {displayCategories.map((_, i) => (
          <span
            key={i === catIdx ? `cy-${globalIdx}` : `y${i}`}
            className={`ks-nav-pip${i === catIdx ? ' active' : ''}`}
          />
        ))}
      </div>

      {/* Meta block */}
      <div className="ks-meta">
        {/* Horizontal dots — in flow 15px above name, centred via full-width meta */}
        {totalFrames > 1 && (
          <div className="ks-nav-dots-x" aria-hidden="true">
            {Array.from({ length: totalFrames }, (_, i) => (
              <span
                key={i === frameForDisplay ? `cx-${globalIdx}` : `x${i}`}
                className={`ks-nav-pip${i === frameForDisplay ? ' active' : ''}`}
              />
            ))}
          </div>
        )}
        <h1 className="ks-name">
          Kshetej<br /><span className="ks-name-last">Sareen</span>
        </h1>
        <div className="ks-subline">
          <div className="ks-subline-col">
            <strong>Independent photographer.</strong><br />Delhi · Bangalore.
          </div>
          <div className="ks-subline-col">
            Available for commission and prints.<br />Booking — info@kshetejsareen.com
          </div>
        </div>
        {/* Inline slate — mobile only · key triggers stagger on frame change (#2) */}
        <div key={`slate-m-${catIdx}-${frameForDisplay}`} className="ks-slate ks-slate--inline">
          <div className="ks-slate-subj">{frame.title}</div>
          <div>{[frame.location, frame.year].filter(Boolean).join(' · ')}</div>
        </div>
      </div>

      {/* Slate — desktop bottom-right · key remounts on change → CSS entrance (#2) */}
      <div key={`slate-${catIdx}-${frameForDisplay}`} className="ks-slate ks-slate--desktop">
        <div className="ks-slate-subj">{frame.title}</div>
        <div>{[frame.location, frame.year].filter(Boolean).join(' · ')}</div>
        {frame.camera && <div>{frame.camera}</div>}
      </div>

      {/* Footer corners — desktop only */}
      <div className="ks-footer-l">© Kshetej Sareen · MMXXVI</div>
      <div className="ks-footer-r">↑ ↓ Categories &nbsp;·&nbsp; ← → Frames</div>

      {/* Brand marquee bar */}
      <BrandMarquee />

      {/* Full-screen menu overlay */}
      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
