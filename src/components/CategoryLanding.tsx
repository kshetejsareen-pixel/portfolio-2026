'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { categories } from '@/lib/categories'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

// Maps category id → its editorial page route
const CATEGORY_ROUTES: Record<string, string> = {
  culinary:  '/culinary',
  spaces:    '/spaces',
  portraits: '/portraits',
  objects:   '/objects',
  motion:    '/motion',
}

export function CategoryLanding() {
  const router = useRouter()
  const [catIdx, setCatIdx] = useState(0)
  const [frameIdx, setFrameIdx] = useState(0)
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const cat = categories[catIdx]
  const frame = cat.frames[frameIdx]
  const totalFrames = cat.frames.length

  // Reset frame when category changes
  useEffect(() => { setFrameIdx(0) }, [catIdx])

  // Keyboard navigation — re-registers whenever catIdx changes to keep totalFrames fresh
  useEffect(() => {
    const total = categories[catIdx].frames.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setFrameIdx((f) => (f + 1) % total)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setFrameIdx((f) => ((f - 1) + total) % total)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCatIdx((c) => (c + 1) % categories.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCatIdx((c) => ((c - 1) + categories.length) % categories.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [catIdx])

  // Idle cycling — 4s idle then advance category every 5s
  const stopCycle = useCallback(() => {
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null }
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null }
  }, [])

  const startIdleCountdown = useCallback(() => {
    stopCycle()
    idleRef.current = setTimeout(() => {
      cycleRef.current = setInterval(() => {
        setCatIdx((c) => (c + 1) % categories.length)
      }, 5000)
    }, 4000)
  }, [stopCycle])

  useEffect(() => {
    startIdleCountdown()
    return stopCycle
  }, [startIdleCountdown, stopCycle])

  const handleCatClick = (i: number) => {
    if (i === catIdx) {
      // Already active — navigate to the category's editorial page
      const route = CATEGORY_ROUTES[categories[i].id]
      if (route) router.push(route)
      return
    }
    stopCycle()
    setCatIdx(i)
    startIdleCountdown()
  }

  // Touch swipe — horizontal for frames, vertical for categories
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (Math.max(absDx, absDy) < 30) return

    if (absDx > absDy) {
      // Horizontal swipe → step through frames
      if (dx < 0) setFrameIdx((f) => (f + 1) % totalFrames)
      else setFrameIdx((f) => ((f - 1) + totalFrames) % totalFrames)
    } else {
      // Vertical swipe → change category
      stopCycle()
      if (dy < 0) setCatIdx((c) => (c + 1) % categories.length)
      else setCatIdx((c) => ((c - 1) + categories.length) % categories.length)
      startIdleCountdown()
    }
  }

  return (
    <div
      className="ks-stage"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* Photo layers — one per category × frame, only active is opaque */}
      <div className="ks-photo-layer">
        {categories.map((c, ci) =>
          c.frames.map((f, fi) => {
            const active = ci === catIdx && fi === frameIdx
            return (
              <div
                key={`${c.id}-${fi}`}
                className={`ks-frame${active ? ' active' : ''}`}
                style={{ backgroundColor: c.tint }}
                aria-hidden={!active}
              >
                {f.image
                  ? <img src={f.image} alt={f.subj} className="ks-frame-img" />
                  : active && (
                    <div className="ks-slot-tag">
                      {c.label.toUpperCase()} · DROP IMAGE — {f.subj.toUpperCase()}
                    </div>
                  )
                }
              </div>
            )
          })
        )}
      </div>

      {/* Background frame numeral — shows category number so it updates on category switch */}
      <div className="ks-counter" aria-hidden="true">{cat.n}</div>

      {/* Cinemascope letterbox bars */}
      <div className="ks-letterbox ks-letterbox--top" />
      <div className="ks-letterbox ks-letterbox--bottom" />

      {/* Top bar — wordmark left, nav right */}
      <div className="ks-top-bar">
        <div className="ks-wordmark">
          <span className="ks-wordmark-ks">Ks</span>
          <span className="ks-eyebrow">Photography</span>
        </div>
        <nav className="ks-top-nav">
          <a className="ks-menu-only">Menu +</a>
          <a>Journal</a>
          <a>Info</a>
          <a className="active">Contact</a>
        </nav>
      </div>

      {/* Category rail (right on desktop, bottom strip on mobile) */}
      <div className="ks-cat-rail">
        {categories.map((c, i) => (
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

      {/* Step hints — hidden on mobile via CSS */}
      {totalFrames > 1 && (
        <>
          <button
            className="ks-step-hint ks-step-hint--prev"
            onClick={() => setFrameIdx((f) => ((f - 1) + totalFrames) % totalFrames)}
            aria-label="Previous frame"
          >
            ←
          </button>
          <button
            className="ks-step-hint ks-step-hint--next"
            onClick={() => setFrameIdx((f) => (f + 1) % totalFrames)}
            aria-label="Next frame"
          >
            →
          </button>
        </>
      )}

      {/* Meta block — bottom-left */}
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
        {/* Subline hidden on mobile via CSS */}
        <div className="ks-subline">
          <div className="ks-subline-col">
            <strong>Independent photographer.</strong><br />New York · Bombay.
          </div>
          <div className="ks-subline-col">
            Available for commission and prints.<br />Booking — studio@ksareen.com
          </div>
        </div>
        {/* Inline slate — shown on mobile only, hidden on desktop via CSS */}
        <div className="ks-slate ks-slate--inline">
          <div className="ks-slate-subj">{frame.subj}</div>
          <div>{frame.loc} · {frame.year}</div>
        </div>
      </div>

      {/* Slate — desktop bottom-right (hidden on mobile via CSS) */}
      <div className="ks-slate ks-slate--desktop">
        <div className="ks-slate-subj">{frame.subj}</div>
        <div>{frame.loc} · {frame.year}</div>
        <div>{frame.gear}</div>
      </div>

      {/* Scrubber bar */}
      <div className="ks-scrubber" aria-hidden="true">
        <div
          className="ks-scrubber-fill"
          style={{ width: `${((frameIdx + 1) / totalFrames) * 100}%` }}
        />
      </div>

      {/* Footer corners — desktop only (hidden on mobile via CSS) */}
      <div className="ks-footer-l">© Kshetej Sareen · MMXXVI</div>
      <div className="ks-footer-r">↑ ↓ Categories &nbsp;·&nbsp; ← → Frames</div>
    </div>
  )
}
