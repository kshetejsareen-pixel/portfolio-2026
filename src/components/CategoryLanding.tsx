'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { categories } from '@/lib/categories'

export function CategoryLanding() {
  const [active, setActive] = useState(categories[0].slug)
  const [hovered, setHovered] = useState<string | null>(null)
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeCategory = categories.find((c) => c.slug === active)!

  const stopCycle = useCallback(() => {
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null }
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null }
  }, [])

  const startIdleCountdown = useCallback(() => {
    stopCycle()
    idleRef.current = setTimeout(() => {
      cycleRef.current = setInterval(() => {
        setActive((prev) => {
          const idx = categories.findIndex((c) => c.slug === prev)
          return categories[(idx + 1) % categories.length].slug
        })
      }, 5000)
    }, 4000)
  }, [stopCycle])

  useEffect(() => {
    startIdleCountdown()
    return stopCycle
  }, [startIdleCountdown, stopCycle])

  const handleEnter = (slug: string) => {
    stopCycle()
    setHovered(slug)
    setActive(slug)
  }

  const handleLeave = () => {
    setHovered(null)
    startIdleCountdown()
  }

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-black select-none">

      {/* ── Photo area ─────────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">

        {categories.map((cat) => (
          <motion.div
            key={cat.slug}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: cat.image }}
            animate={{ opacity: active === cat.slug ? 1 : 0 }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
        ))}

        <motion.div
          className="absolute inset-0 bg-black"
          animate={{ opacity: hovered ? 0.28 : 0.50 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 md:px-16 md:py-12">
          <div className="flex justify-end">
            <motion.p
              className="text-[10px] font-medium tracking-[0.5em] text-white/35 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.9 }}
            >
              Photography
            </motion.p>
          </div>

          <div>
            <motion.h1
              className="text-[clamp(3.2rem,12vw,12rem)] font-extralight leading-[0.97] tracking-[-0.03em] text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              Kshetej<br />Sareen
            </motion.h1>

            <motion.div
              className="mt-4 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  className="text-[10px] font-medium tracking-[0.45em] text-white/45 uppercase"
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -7 }}
                  transition={{ duration: 0.28 }}
                >
                  {activeCategory.label}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Category bar ───────────────────────────────────────── */}
      <motion.nav
        className="relative z-10 flex shrink-0 flex-col border-t border-white/[0.08] bg-black/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-[72px] w-full">
        {categories.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden px-1"
            onMouseEnter={() => handleEnter(cat.slug)}
            onMouseLeave={handleLeave}
          >
            {/* Active indicator line with glow */}
            <motion.span
              className="absolute inset-x-0 top-0 h-[1.5px] origin-left bg-white"
              animate={{
                scaleX: active === cat.slug ? 1 : 0,
                opacity: active === cat.slug ? 1 : 0,
                boxShadow: active === cat.slug
                  ? '0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.25)'
                  : '0 0 8px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0)',
              }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            {i > 0 && (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/[0.06]" />
            )}

            {/* Label with glow on active */}
            <motion.span
              className="truncate text-[9px] font-medium uppercase tracking-[0.05em] md:text-[13px] md:tracking-[0.08em]"
              animate={{
                color: active === cat.slug
                  ? 'rgba(255,255,255,1)'
                  : hovered
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.72)',
                textShadow: active === cat.slug
                  ? '0 0 16px rgba(255,255,255,0.5), 0 0 32px rgba(255,255,255,0.2)'
                  : '0 0 16px rgba(255,255,255,0), 0 0 32px rgba(255,255,255,0)',
              }}
              transition={{ duration: 0.35 }}
            >
              {cat.label}
            </motion.span>
          </Link>
        ))}
        </div>
      </motion.nav>
    </main>
  )
}
