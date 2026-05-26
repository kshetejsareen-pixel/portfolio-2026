'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CLASS_SELECTORS = '.cat-row, .cat-project, .proj-gallery-col'
const ATTR_SELECTOR   = '[data-sr]'
const FULL_SELECTOR   = `${CLASS_SELECTORS}, ${ATTR_SELECTOR}`

export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible')
          } else {
            entry.target.classList.remove('sr-visible')
          }
        })
      },
      // -8% top: content starts fading before it fully exits at the top
      // -10% bottom: content only begins to appear once meaningfully on screen
      { threshold: 0, rootMargin: '-8% 0px -10% 0px' },
    )

    function observeAll() {
      document.querySelectorAll(FULL_SELECTOR).forEach((el) => obs.observe(el))
    }

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
