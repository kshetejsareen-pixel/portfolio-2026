'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { MotionVideo } from '@/lib/motionVideos'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

let _ytReady = false
const _ytQueue: (() => void)[] = []

function loadYouTubeAPI() {
  if (typeof window === 'undefined') return
  if (_ytReady) return
  if (document.getElementById('yt-iframe-api')) return
  const prev = window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = () => {
    prev?.()
    _ytReady = true
    _ytQueue.forEach((cb) => cb())
    _ytQueue.length = 0
  }
  const tag = document.createElement('script')
  tag.id = 'yt-iframe-api'
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
}

function onYTReady(cb: () => void) {
  if (_ytReady && window.YT?.Player) cb()
  else _ytQueue.push(cb)
}

export function MotionVideoGallery({ videos }: { videos: MotionVideo[] }) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const touchStartY = useRef(0)
  const scrollLock = useRef(false)

  useEffect(() => { loadYouTubeAPI() }, [])

  const goTo = useCallback((idx: number) => {
    const gallery = galleryRef.current
    const items = gallery?.querySelectorAll('.motion-reel-item')
    const el = items?.[idx] as HTMLElement | undefined
    if (!el || scrollLock.current) return
    scrollLock.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveIndex(idx)
    setTimeout(() => { scrollLock.current = false }, 900)
  }, [])

  // Swipe gesture (touch + mouse wheel) for next/prev
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      if (activeIndex === null) return
      const dy = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(dy) < 60) return
      if (dy > 0 && activeIndex < videos.length - 1) goTo(activeIndex + 1)
      else if (dy < 0 && activeIndex > 0) goTo(activeIndex - 1)
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [activeIndex, videos.length, goTo])

  if (videos.length === 0) return null

  return (
    <div className="motion-reel-gallery" ref={galleryRef}>
      {videos.map((video, i) => (
        <MotionReelItem
          key={video.id}
          video={video}
          index={i}
          galleryRef={galleryRef}
          isActive={activeIndex === i}
          onActivate={() => setActiveIndex(i)}
        />
      ))}
    </div>
  )
}

function MotionReelItem({
  video, index, galleryRef, isActive, onActivate,
}: {
  video: MotionVideo
  index: number
  galleryRef: React.RefObject<HTMLDivElement | null>
  isActive: boolean
  onActivate: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const playerId = `yt-reel-${video.id}`
  const isPortrait = video.isShort

  useEffect(() => {
    const init = () => {
      if (!window.YT?.Player) return
      playerRef.current = new window.YT.Player(playerId, {
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 0,
          mute: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            const el = containerRef.current
            if (!el) return
            observerRef.current = new IntersectionObserver(
              (entries) => {
                const e = entries[0]
                if (e.isIntersecting) {
                  playerRef.current?.playVideo()
                  onActivate()
                } else {
                  playerRef.current?.pauseVideo()
                }
              },
              { root: galleryRef.current, threshold: 0.7 }
            )
            observerRef.current.observe(el)
          },
        },
      })
    }
    onYTReady(init)
    return () => {
      observerRef.current?.disconnect()
      playerRef.current?.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.youtubeId, playerId])

  return (
    <div
      className={`motion-reel-item${isPortrait ? ' motion-reel-item--portrait' : ' motion-reel-item--landscape'}${isActive ? ' motion-reel-item--active' : ''}`}
      ref={containerRef}
    >
      {/* Top fade */}
      <div className="motion-reel-fade motion-reel-fade--top" />

      {/* Video */}
      <div className="motion-reel-video-wrap">
        <div id={playerId} className="motion-reel-player" />
      </div>

      {/* Bottom gradient + meta */}
      <div className="motion-reel-bottom">
        {(video.title || video.year || video.location) && (
          <div className="motion-reel-meta">
            {video.title && <span className="motion-reel-title">{video.title}</span>}
            {(video.location || video.year) && (
              <span className="motion-reel-sub">
                {[video.location, video.year].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Index dot */}
      <div className="motion-reel-index">{String(index + 1).padStart(2, '0')}</div>
    </div>
  )
}
