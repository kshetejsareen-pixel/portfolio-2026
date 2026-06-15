'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const FADE_MS = 500

interface TransitionCtx { navigate: (href: string) => void }
const Ctx = createContext<TransitionCtx>({ navigate: () => {} })

export function useNavigate() {
  return useContext(Ctx).navigate
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router     = useRouter()
  const pathname   = usePathname()
  const [opacity,  setOpacity]  = useState(0)
  const [exiting,  setExiting]  = useState(false)
  const pendingNav = useRef<string | null>(null)

  // New page settled — fade in from slightly below
  useEffect(() => {
    setExiting(false)
    const t = setTimeout(() => setOpacity(1), 30)
    return () => clearTimeout(t)
  }, [pathname])

  // Fade out upward, then push new route
  const navigate = useCallback((href: string) => {
    if (href === pathname) return
    pendingNav.current = href
    setExiting(true)
    setOpacity(0)
    setTimeout(() => {
      if (pendingNav.current) {
        router.push(pendingNav.current)
        pendingNav.current = null
      }
    }, FADE_MS)
  }, [router, pathname])

  // Intercept every internal <a> click sitewide
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      e.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', handle, true)
    return () => document.removeEventListener('click', handle, true)
  }, [navigate])

  return (
    <Ctx.Provider value={{ navigate }}>
      <motion.div
        animate={{
          opacity,
          y: opacity === 1 ? 0 : exiting ? -14 : 14,
        }}
        transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </Ctx.Provider>
  )
}
