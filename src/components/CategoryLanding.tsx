'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { categories } from '@/lib/categories'

export function CategoryLanding() {
  const [active, setActive] = useState(categories[0].slug)
  const [hovered, setHovered] = useState<string | null>(null)

  const activeCategory = categories.find((c) => c.slug === active)!

  const handleEnter = (slug: string) => {
    setHovered(slug)
    setActive(slug)
  }
  const handleLeave = () => setHovered(null)

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-black select-none">

      {/* ── Photo area ─────────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">

        {/* Full-bleed images */}
        {categories.map((cat) => (
          <motion.div
            key={cat.slug}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: cat.image }}
            animate={{ opacity: active === cat.slug ? 1 : 0 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
        ))}

        {/* Scrim — lifts on hover */}
        <motion.div
          className="absolute inset-0 bg-black"
          animate={{ opacity: hovered ? 0.28 : 0.50 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Bottom gradient for name legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />

        {/* Photo-area content */}
        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 md:px-16 md:py-12">

          {/* Top-right: discipline */}
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

          {/* Bottom-left: name + active label */}
          <div>
            <motion.h1
              className="text-[clamp(3rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.025em] text-white"
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
        className="relative z-10 flex h-[72px] shrink-0 border-t border-white/[0.08] bg-black/90 backdrop-blur-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {categories.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group relative flex flex-1 flex-col items-center justify-center gap-1"
            onMouseEnter={() => handleEnter(cat.slug)}
            onMouseLeave={handleLeave}
          >
            {/* Active indicator line — slides in from left */}
            <motion.span
              className="absolute inset-x-0 top-0 h-[1.5px] origin-left bg-white"
              animate={{
                scaleX: active === cat.slug ? 1 : 0,
                opacity: active === cat.slug ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Vertical divider between columns */}
            {i > 0 && (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/[0.06]" />
            )}

            {/* Number */}
            <motion.span
              className="text-[9px] tabular-nums tracking-[0.28em]"
              animate={{
                color: active === cat.slug ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)',
              }}
              transition={{ duration: 0.25 }}
            >
              0{i + 1}
            </motion.span>

            {/* Label — full on desktop, short on mobile */}
            <motion.span
              animate={{
                color: active === cat.slug
                  ? 'rgba(255,255,255,1)'
                  : hovered
                  ? 'rgba(255,255,255,0.28)'
                  : 'rgba(255,255,255,0.55)',
              }}
              transition={{ duration: 0.25 }}
            >
              <span className="hidden text-[11px] font-medium tracking-[0.2em] uppercase md:block">
                {cat.label}
              </span>
              <span className="block text-[10px] font-medium tracking-[0.18em] uppercase md:hidden">
                {cat.short}
              </span>
            </motion.span>
          </Link>
        ))}
      </motion.nav>
    </main>
  )
}
