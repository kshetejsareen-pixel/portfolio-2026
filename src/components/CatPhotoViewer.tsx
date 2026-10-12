'use client'

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react'
import type { FlowPhoto } from '@/lib/categoryData'
import { cloudinarySrcSet } from '@/lib/imageSrcSet'

// Full-screen photo viewer for the category pages.
//
// The editorial flow is a tree of row kinds, not a list, so the grid cannot
// tell a photo its position in the sequence. Instead the page flattens the
// flow once and hands that array down here; CatPhoto asks to be opened by
// passing its own photo object, and we find it by identity. Both arrays come
// from the same render of the same flow, so the references match.

type ViewerApi = { open: (photo: FlowPhoto) => void }

const ViewerCtx = createContext<ViewerApi | null>(null)

export function useCatViewer() {
  return useContext(ViewerCtx)
}

export function CatViewerProvider({
  photos, children,
}: { photos: FlowPhoto[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null)

  const open = useCallback((photo: FlowPhoto) => {
    const i = photos.indexOf(photo)
    if (i >= 0) setIndex(i)
  }, [photos])

  const api = useRef<ViewerApi>({ open })
  api.current.open = open

  return (
    <ViewerCtx.Provider value={api.current}>
      {children}
      {index !== null && (
        <CatViewer
          photos={photos}
          index={index}
          onIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </ViewerCtx.Provider>
  )
}

const MAX_SCALE = 4
// Past this much horizontal travel a drag counts as a swipe, not a stray
// finger. 60px is short enough to feel light on a 390px screen.
const SWIPE_PX = 60
const DOUBLE_TAP_MS = 300

type Zoom = { s: number; x: number; y: number }
const NO_ZOOM: Zoom = { s: 1, x: 0, y: 0 }

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function CatViewer({
  photos, index, onIndex, onClose,
}: {
  photos: FlowPhoto[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const photo = photos[index]
  const [zoom, setZoom] = useState<Zoom>(NO_ZOOM)
  const [dragX, setDragX] = useState(0)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const go = useCallback((step: number) => {
    const next = index + step
    if (next < 0 || next >= photos.length) return
    onIndex(next)
  }, [index, photos.length, onIndex])

  // A new photo always starts unzoomed and un-dragged, however the last one
  // was left.
  useEffect(() => {
    setZoom(NO_ZOOM)
    setDragX(0)
  }, [index])

  // Rotating the phone relays the image at a new fit size, which leaves any
  // zoom offset measured against the old one — and a pan clamped to bounds
  // that no longer exist. Start the new orientation fitted.
  useEffect(() => {
    const onResize = () => setZoom(NO_ZOOM)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // The page behind must not scroll while the overlay is up — on iOS a stray
  // scroll under a fixed overlay is what makes a lightbox feel broken.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Warm the neighbours so an arrow or a swipe lands on a painted image
  // rather than a blank frame.
  useEffect(() => {
    for (const n of [index - 1, index + 1]) {
      const p = photos[n]
      if (!p?.image) continue
      const img = new Image()
      img.src = p.image
    }
  }, [index, photos])

  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Hold the photograph over the frame. At scale s it may travel at most half
  // its own overflow before an edge pulls inside the stage; without this a pan
  // can fling the image into the void and leave a black screen.
  const clamp = useCallback((z: Zoom): Zoom => {
    const im = imgRef.current
    const st = stageRef.current
    if (!im || !st) return z
    const maxX = Math.max(0, (im.offsetWidth * z.s - st.clientWidth) / 2)
    const maxY = Math.max(0, (im.offsetHeight * z.s - st.clientHeight) / 2)
    return {
      s: z.s,
      x: Math.min(maxX, Math.max(-maxX, z.x)),
      y: Math.min(maxY, Math.max(-maxY, z.y)),
    }
  }, [])

  // Toggle between fit and 2.5x, anchored on the point that was tapped so the
  // detail under the finger stays under the finger.
  const toggleZoomAt = useCallback((cx: number, cy: number, rect: DOMRect) => {
    setZoom((z) => {
      if (z.s > 1) return NO_ZOOM
      const s = 2.5
      const mx = cx - rect.left - rect.width / 2
      const my = cy - rect.top - rect.height / 2
      return clamp({ s, x: -mx * (s - 1), y: -my * (s - 1) })
    })
  }, [clamp])

  const g = useRef({
    mode: 'none' as 'none' | 'pan' | 'swipe' | 'pinch',
    x0: 0, y0: 0, d0: 0, s0: 1, ox: 0, oy: 0, mx: 0, my: 0,
    moved: false, lastTap: 0,
  })

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches
    const z = zoomRef.current
    if (t.length === 2) {
      const dx = t[0].clientX - t[1].clientX
      const dy = t[0].clientY - t[1].clientY
      g.current.mode = 'pinch'
      g.current.d0 = Math.hypot(dx, dy)
      g.current.s0 = z.s
      g.current.ox = z.x
      g.current.oy = z.y
      const rect = stageRef.current?.getBoundingClientRect()
      g.current.mx = (t[0].clientX + t[1].clientX) / 2 - (rect ? rect.left + rect.width / 2 : 0)
      g.current.my = (t[0].clientY + t[1].clientY) / 2 - (rect ? rect.top + rect.height / 2 : 0)
    } else if (t.length === 1) {
      g.current.mode = z.s > 1 ? 'pan' : 'swipe'
      g.current.x0 = t[0].clientX
      g.current.y0 = t[0].clientY
      g.current.ox = z.x
      g.current.oy = z.y
      g.current.moved = false
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches
    const s = g.current
    if (s.mode === 'pinch' && t.length === 2) {
      const d = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
      const scale = Math.min(MAX_SCALE, Math.max(1, s.s0 * (d / s.d0)))
      const k = scale / s.s0
      setZoom(clamp({
        s: scale,
        x: s.mx - (s.mx - s.ox) * k,
        y: s.my - (s.my - s.oy) * k,
      }))
      s.moved = true
    } else if (s.mode === 'pan' && t.length === 1) {
      setZoom((z) => clamp({
        s: z.s,
        x: s.ox + (t[0].clientX - s.x0),
        y: s.oy + (t[0].clientY - s.y0),
      }))
      s.moved = true
    } else if (s.mode === 'swipe' && t.length === 1) {
      const dx = t[0].clientX - s.x0
      const dy = t[0].clientY - s.y0
      // Only claim the gesture once it is clearly horizontal, so a vertical
      // flick still reads as "I want out of here".
      if (Math.abs(dx) > Math.abs(dy)) {
        setDragX(dx)
        if (Math.abs(dx) > 8) s.moved = true
      }
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = g.current
    if (s.mode === 'swipe') {
      if (dragX <= -SWIPE_PX) go(1)
      else if (dragX >= SWIPE_PX) go(-1)
      setDragX(0)
    }
    // A tap that never moved is either a double-tap zoom or a request to
    // leave. Touch end carries no coordinates, so take the last one that did.
    if (!s.moved && e.changedTouches.length === 1) {
      const now = Date.now()
      const tap = e.changedTouches[0]
      if (now - s.lastTap < DOUBLE_TAP_MS) {
        const rect = stageRef.current?.getBoundingClientRect()
        if (rect) toggleZoomAt(tap.clientX, tap.clientY, rect)
        s.lastTap = 0
      } else {
        s.lastTap = now
      }
    }
    s.mode = 'none'
  }

  const onWheel = (e: React.WheelEvent) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setZoom((z) => {
      const scale = Math.min(MAX_SCALE, Math.max(1, z.s * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))
      if (scale === 1) return NO_ZOOM
      const k = scale / z.s
      const mx = e.clientX - rect.left - rect.width / 2
      const my = e.clientY - rect.top - rect.height / 2
      return clamp({ s: scale, x: mx - (mx - z.x) * k, y: my - (my - z.y) * k })
    })
  }

  const meta = [photo.location, photo.year].filter(Boolean).join(' · ')
  const dragging = dragX !== 0

  return (
    <div
      className="cat-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button className="cat-viewer-close" onClick={onClose} aria-label="Close">
        <span aria-hidden="true">×</span>
      </button>

      {index > 0 && (
        <button
          className="cat-viewer-nav cat-viewer-prev"
          onClick={() => go(-1)}
          aria-label="Previous photograph"
        >
          <span aria-hidden="true">‹</span>
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          className="cat-viewer-nav cat-viewer-next"
          onClick={() => go(1)}
          aria-label="Next photograph"
        >
          <span aria-hidden="true">›</span>
        </button>
      )}

      <div
        ref={stageRef}
        className="cat-viewer-stage"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        onDoubleClick={(e) => {
          const rect = stageRef.current?.getBoundingClientRect()
          if (rect) toggleZoomAt(e.clientX, e.clientY, rect)
        }}
      >
        {photo.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo.image}
            srcSet={cloudinarySrcSet(photo.image)}
            sizes="100vw"
            alt={photo.title}
            className="cat-viewer-img"
            ref={imgRef}
            draggable={false}
            style={{
              transform: `translate3d(${zoom.x + dragX}px, ${zoom.y}px, 0) scale(${zoom.s})`,
              transition: dragging || g.current.mode !== 'none' ? 'none' : 'transform 220ms ease',
            }}
          />
        )}
      </div>

      <div className="cat-viewer-cap">
        <span className="cat-viewer-subj">
          {pad2(index + 1)}<span className="cat-viewer-dot">·</span>{photo.title}
        </span>
        {meta && <span className="cat-viewer-meta">{meta}</span>}
        <span className="cat-viewer-count">{pad2(index + 1)} / {pad2(photos.length)}</span>
      </div>
    </div>
  )
}
