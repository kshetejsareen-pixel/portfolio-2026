'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const FADE_MS = 700

interface TransitionCtx { navigate: (href: string) => void }
const Ctx = createContext<TransitionCtx>({ navigate: () => {} })

export function useNavigate() {
  return useContext(Ctx).navigate
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [opacity, setOpacity] = useState(0)
  const pendingNav = useRef<string | null>(null)

  // Fade in whenever the route settles on a new page
  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 30)
    return () => clearTimeout(t)
  }, [pathname])

  // Fade out then push — used by both click interceptor and programmatic nav
  const navigate = useCallback((href: string) => {
    if (href === pathname) return
    pendingNav.current = href
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
      if (!href || !href.startsWith('/')) return   // skip external / mailto / hash
      e.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', handle, true) // capture phase
    return () => document.removeEventListener('click', handle, true)
  }, [navigate])

  return (
    <Ctx.Provider value={{ navigate }}>
      <div style={{ opacity, transition: `opacity ${FADE_MS}ms ease` }}>
        {children}
      </div>
    </Ctx.Provider>
  )
}
