'use client'

import { useEffect, useRef } from 'react'
import type { MotionVideo } from '@/lib/motionVideos'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Module-level: one shared ready queue so multiple players don't stomp each other
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
  if (_ytReady && window.YT?.Player) {
    cb()
  } else {
    _ytQueue.push(cb)
  }
}

export function MotionVideoGallery({ videos }: { videos: MotionVideo[] }) {
  useEffect(() => { loadYouTubeAPI() }, [])

  if (videos.length === 0) return null

  return (
    <section className="motion-video-gallery">
      {videos.map((video, i) => (
        <MotionVideoItem key={video.id} video={video} index={i} />
      ))}
    </section>
  )
}

function MotionVideoItem({ video, index }: { video: MotionVideo; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const playerId = `yt-player-${video.id}`

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
                } else {
                  playerRef.current?.pauseVideo()
                }
              },
              { threshold: 0.5 }
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
  }, [video.youtubeId, playerId])

  return (
    <div
      className="motion-video-item"
      ref={containerRef}
      data-sr
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="motion-video-wrap">
        <div id={playerId} className="motion-video-player" />
      </div>
      {(video.title || video.year || video.location) && (
        <div className="motion-video-meta">
          {video.title && (
            <span className="motion-video-title">{video.title}</span>
          )}
          {(video.location || video.year) && (
            <span className="motion-video-sub">
              {[video.location, video.year].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
