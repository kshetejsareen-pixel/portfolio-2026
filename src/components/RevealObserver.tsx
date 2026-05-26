'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Automatically observed by class — no data-sr needed on these elements
const CLASS_SELECTORS = '.cat-row, .cat-project, .proj-gallery-col'

// Elements that need data-sr in JSX
const ATTR_SELECTOR = '[data-sr]'

const FULL_SELECTOR = `${CLASS_SELECTORS}, ${ATTR_SELECTOR}`

export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -48px 0px' },
    )

    function observeAll() {
      document.querySelectorAll(FULL_SELECTOR).forEach((el) => {
        if (!el.classList.contains('sr-visible')) obs.observe(el)
      })
    }

    // Observe on mount and re-observe when DOM updates (route change adds new elements)
    observeAll()
    const mut = new MutationObserver(observeAll)
    mut.observe(document.body, { childList: true, subtree: true })

    return () => {
      obs.disconnect()
      mut.disconnect()
    }
  }, [pathname])

  return null
}
