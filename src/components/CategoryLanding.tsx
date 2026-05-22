'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { categories } from '@/lib/categories'

export function CategoryLanding() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-brand-black">
      {/* Name masthead */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute inset-x-0 top-0 z-20 flex justify-center py-8"
      >
        <h1 className="text-[11px] font-medium tracking-[0.4em] text-brand-silver uppercase">
          Kshetej Sareen
        </h1>
      </motion.header>

      {/* Desktop: horizontal expanding strips */}
      <div className="hidden h-full md:flex">
        {categories.map((category, i) => (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 + 0.3 }}
            className="relative overflow-hidden"
            style={{
              flexBasis: hovered === category.slug ? '38%' : hovered ? '20.67%' : '25%',
              flexShrink: 0,
              transition: 'flex-basis 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onHoverStart={() => setHovered(category.slug)}
            onHoverEnd={() => setHovered(null)}
          >
            <Link href={`/${category.slug}`} className="block h-full w-full">
              {/* Background image */}
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: category.image }}
                animate={{ scale: hovered === category.slug ? 1.05 : 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Gradient overlay */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background:
                    hovered === category.slug
                      ? 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.1) 55%)'
                      : 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.65) 100%)',
                }}
                transition={{ duration: 0.5 }}
              />
              {/* Index number */}
              <motion.span
                className="absolute left-6 top-8 text-[10px] font-medium tracking-[0.3em] text-white"
                animate={{ opacity: hovered === category.slug ? 0.5 : 0.15 }}
                transition={{ duration: 0.3 }}
              >
                0{i + 1}
              </motion.span>
              {/* Category label */}
              <div className="absolute inset-x-0 bottom-0 p-8">
                <motion.p
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium tracking-[0.25em] text-white uppercase"
                  animate={{ opacity: hovered === category.slug ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                >
                  {category.label}
                </motion.p>
                <AnimatePresence>
                  {hovered === category.slug && (
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      className="mt-1.5 block text-[9px] tracking-[0.35em] text-white/30 uppercase"
                    >
                      View work →
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile: stacked horizontal strips */}
      <div className="flex h-full flex-col md:hidden">
        {categories.map((category, i) => (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 + 0.3 }}
            className="relative flex-1 overflow-hidden"
          >
            <Link href={`/${category.slug}`} className="block h-full w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: category.image }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-black/85 via-brand-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center gap-4 px-7">
                <span className="text-[9px] font-medium tracking-[0.3em] text-white/25">
                  0{i + 1}
                </span>
                <p className="text-[11px] font-medium tracking-[0.25em] text-white uppercase">
                  {category.label}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  )
}
