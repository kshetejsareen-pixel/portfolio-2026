'use client'

import { useEffect } from 'react'
import type { FontConfig } from '@/lib/fontConfig'

// Google Fonts query strings for each supported family
export const GFONTS: Record<string, string> = {
  'Bodoni Moda':        'Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400',
  'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,500;1,400',
  'Playfair Display':   'Playfair+Display:ital,wght@0,400;0,500;1,400',
  'IM Fell English':    'IM+Fell+English:ital@0;1',
  'Libre Baskerville':  'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
  'Lora':               'Lora:ital,wght@0,400;0,500;1,400',
  'JetBrains Mono':     'JetBrains+Mono:wght@400;500',
  'IBM Plex Mono':      'IBM+Plex+Mono:wght@400;500',
  'Fira Code':          'Fira+Code:wght@400;500',
  'Space Mono':         'Space+Mono:ital,wght@0,400;0,700;1,400',
  'Courier Prime':      'Courier+Prime:ital,wght@0,400;0,700;1,400',
  'Inter':              'Inter:wght@400;500',
  'DM Sans':            'DM+Sans:wght@400;500',
  'Outfit':             'Outfit:wght@400;500',
  'Plus Jakarta Sans':  'Plus+Jakarta+Sans:wght@400;500',
}

const DEFAULT_SERIF = 'Bodoni Moda'
const DEFAULT_MONO  = 'JetBrains Mono'
const DEFAULT_SANS  = 'Inter'

export function applyFontConfig(config: FontConfig) {
  const { serifFamily, monoFamily, sansFamily } = config

  const nonDefault = ([serifFamily, monoFamily, sansFamily].filter(Boolean) as string[]).filter(
    (f) => f !== DEFAULT_SERIF && f !== DEFAULT_MONO && f !== DEFAULT_SANS && GFONTS[f] != null
  )

  if (nonDefault.length > 0) {
    const href = `https://fonts.googleapis.com/css2?${nonDefault.map((f) => `family=${GFONTS[f]}`).join('&')}&display=swap`
    if (!document.querySelector(`link[data-ks-font="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.setAttribute('data-ks-font', href)
      document.head.appendChild(link)
    }
  }

  let css = ':root {'
  if (serifFamily) css += `--font-serif:'${serifFamily}','Bodoni 72',serif;`
  if (monoFamily)  css += `--font-mono:'${monoFamily}','Fira Code',monospace;`
  if (sansFamily)  css += `--font-sans:'${sansFamily}',system-ui,sans-serif;`
  css += '}'

  let el = document.getElementById('ks-font-override') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'ks-font-override'
    document.head.appendChild(el)
  }
  el.textContent = css
}

export function FontLoader() {
  useEffect(() => {
    fetch('/api/fonts')
      .then((r) => r.json())
      .then((data: { config: FontConfig }) => {
        const c = data.config ?? {}
        if (c.serifFamily || c.monoFamily || c.sansFamily) applyFontConfig(c)
      })
      .catch(() => {})
  }, [])

  return null
}
