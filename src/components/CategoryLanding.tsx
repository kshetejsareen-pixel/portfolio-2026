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
    <main className="relative h-screen w-full overflow-hidden bg-black select-none">

      {/* Full-bleed images — crossfade */}
      {categories.map((cat) => (
        <motion.div
          key={cat.slug}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: cat.image }}
          animate={{ opacity: active === cat.slug ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}

      {/* Scrim — lifts on hover to reveal more of the photo */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: hovered ? 0.3 : 0.52 }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Bottom gradient — anchors the editorial footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Top gradient — softens the sky edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Layout */}
      <div className="relative z-10 flex h-full flex-col justify-between px-10 py-11 md:px-16 md:py-14">

        {/* Top-right: discipline label */}
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

        {/* Bottom row: name (left) + nav (right) */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">

          {/* Name block */}
          <div>
            <motion.h1
              className="text-[clamp(3rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.025em] text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              Kshetej<br />Sareen
            </motion.h1>

            {/* Active category — crossfades on change */}
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

          {/* Category nav */}
          <motion.nav
            className="flex flex-row flex-wrap gap-x-8 gap-y-4 md:flex-col md:items-end md:gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="flex items-center gap-3"
                onMouseEnter={() => handleEnter(cat.slug)}
                onMouseLeave={handleLeave}
              >
                <motion.span
                  className="hidden text-[9px] tabular-nums tracking-[0.3em] md:block"
                  animate={{
                    color: active === cat.slug
                      ? 'rgba(255,255,255,0.45)'
                      : 'rgba(255,255,255,0.18)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  0{i + 1}
                </motion.span>
                <motion.span
                  className="text-[10px] font-medium tracking-[0.28em] uppercase"
                  animate={{
                    color: active === cat.slug
                      ? 'rgba(255,255,255,1)'
                      : hovered
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.45)',
                  }}
                  transition={{ duration: 0.28 }}
                >
                  {cat.label}
                </motion.span>
              </Link>
            ))}
          </motion.nav>
        </div>
      </div>
    </main>
  )
}
