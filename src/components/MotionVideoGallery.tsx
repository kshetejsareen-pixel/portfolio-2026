'use client'

import { useEffect, useRef, useState } from 'react'
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
  useEffect(() => { loadYouTubeAPI() }, [])

  if (videos.length === 0) return null

  return (
    <div className="motion-reel-gallery">
      {videos.map((video, i) => (
        <MotionReelItem key={video.id} video={video} index={i} total={videos.length} />
      ))}
    </div>
  )
}

function MotionReelItem({
  video, index, total,
}: {
  video: MotionVideo
  index: number
  total: number
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const playerId = `yt-reel-${video.id}`
  const isPortrait = video.isShort
  const [isActive, setIsActive] = useState(false)
  const [muted, setMuted] = useState(true)

  // IntersectionObserver — no scroll container, just the viewport.
  // Play when ≥55% visible; pause and reset mute when leaving.
  useEffect(() => {
    const el = itemRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting)
        if (!entry.isIntersecting) setMuted(true)
      },
      { root: null, threshold: 0.55 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Init YT player once
  useEffect(() => {
    const init = () => {
      if (!window.YT?.Player) return
      playerRef.current = new window.YT.Player(playerId, {
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 0,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
        },
      })
    }
    onYTReady(init)
    return () => { playerRef.current?.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.youtubeId, playerId])

  // Play / pause based on visibility
  useEffect(() => {
    if (!playerRef.current) return
    if (isActive) playerRef.current.playVideo?.()
    else playerRef.current.pauseVideo?.()
  }, [isActive])

  // Sync mute state to player
  useEffect(() => {
    if (!playerRef.current) return
    if (muted) playerRef.current.mute?.()
    else playerRef.current.unMute?.()
  }, [muted])

  return (
    <div
      ref={itemRef}
      className={[
        'motion-reel-item',
        isPortrait ? 'motion-reel-item--portrait' : 'motion-reel-item--landscape',
        isActive ? 'motion-reel-item--active' : '',
      ].join(' ').trim()}
    >
      <div className="motion-reel-fade motion-reel-fade--top" />

      <div className="motion-reel-video-wrap">
        <div id={playerId} className="motion-reel-player" />
        {/* Overlay keeps the video non-interactive (no accidental YT clicks) */}
        <div className="motion-reel-event-layer" />
      </div>

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

      <div className="motion-reel-index">{index + 1} / {total}</div>

      {isActive && (
        <button
          className={`motion-reel-mute-btn${muted ? '' : ' unmuted'}`}
          onClick={() => setMuted((m) => !m)}
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
      )}
    </div>
  )
}
