'use client'

import Link from 'next/link'
import { useState } from 'react'
import { categories } from '@/lib/categories'

export function CategoryLanding() {
  const [active, setActive] = useState<string | null>(null)
  const activeCategory = categories.find((item) => item.slug === active)

  return (
    <main
      className="min-h-screen bg-brand-black text-white"
      style={{
        backgroundImage: activeCategory
          ? `linear-gradient(rgba(10,10,10,0.62), rgba(10,10,10,0.62)), ${activeCategory.image}`
          : 'linear-gradient(180deg, rgba(10,10,10,0.95), rgba(10,10,10,0.95))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.3s ease-in-out',
      }}
    >
      <div className="grid min-h-screen place-items-center px-6 py-24 sm:px-8">
        <div className="w-full max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Kshetej Sareen
            </h1>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="group flex h-32 items-center justify-center rounded-[2rem] border border-white/15 bg-white/5 text-center text-xl font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/10"
                onMouseEnter={() => setActive(category.slug)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="pointer-events-none">{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
