'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { categories } from '@/lib/categories'

export function CategoryLanding() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black select-none">

      {/* Full-bleed images — each crossfades independently */}
      {categories.map((cat) => (
        <motion.div
          key={cat.slug}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: cat.image }}
          animate={{ opacity: hovered === cat.slug ? 1 : 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}

      {/* Dark scrim — lifts when image is active */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: hovered ? 0.42 : 0.0 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Edge vignette — always present */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />

      {/* Bottom gradient for nav legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Content layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 py-12">

        {/* Top: wordmark */}
        <motion.p
          className="text-[11px] font-medium tracking-[0.45em] text-white/40 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          Photography
        </motion.p>

        {/* Center: name */}
        <div className="text-center">
          <motion.h1
            className="text-[clamp(3.8rem,10vw,9.5rem)] font-extralight leading-none tracking-[-0.02em] text-white"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            Kshetej
          </motion.h1>
          <motion.h1
            className="text-[clamp(3.8rem,10vw,9.5rem)] font-extralight leading-none tracking-[-0.02em] text-white"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            Sareen
          </motion.h1>
        </div>

        {/* Bottom: category nav */}
        <motion.nav
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group flex flex-col items-center gap-2"
              onMouseEnter={() => setHovered(cat.slug)}
              onMouseLeave={() => setHovered(null)}
            >
              <motion.span
                className="block text-[10px] font-medium tracking-[0.35em] uppercase"
                animate={{
                  color: hovered === cat.slug
                    ? 'rgba(255,255,255,1)'
                    : hovered
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.55)',
                }}
                transition={{ duration: 0.3 }}
              >
                {cat.label}
              </motion.span>

              {/* Underline reveal */}
              <motion.span
                className="block h-px w-full bg-white"
                style={{ originX: '0%' }}
                animate={{
                  scaleX: hovered === cat.slug ? 1 : 0,
                  opacity: hovered === cat.slug ? 0.7 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </Link>
          ))}
        </motion.nav>
      </div>
    </main>
  )
}
