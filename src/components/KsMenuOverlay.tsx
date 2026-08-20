'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { categories } from '@/lib/categories'

const CATEGORY_ROUTES: Record<string, string> = {
  culinary:  '/culinary',
  spaces:    '/spaces',
  portraits: '/portraits',
  objects:   '/objects',
  motion:    '/motion',
}

export function KsMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [orderedCats, setOrderedCats] = useState(categories)

  useEffect(() => {
    fetch('/api/category-order')
      .then((r) => r.json())
      .then(({ order }: { order?: string[] }) => {
        if (!Array.isArray(order) || order.length === 0) return
        setOrderedCats(
          [...categories].sort((a, b) => {
            const ai = order.indexOf(a.id)
            const bi = order.indexOf(b.id)
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
          })
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className={`ks-menu-overlay${open ? ' open' : ''}`} aria-hidden={!open}>
      <button className="ks-menu-close-btn" onClick={onClose}>Close ×</button>
      <div className="ks-menu-inner">
        <div className="ks-menu-eyebrow">Navigation</div>
        <nav className="ks-menu-cats">
          <Link href="/" className="ks-menu-cat-link" onClick={onClose}>
            <span className="ks-menu-cat-name">Home</span>
          </Link>
          {orderedCats.map((c) => (
            <Link
              key={c.id}
              href={CATEGORY_ROUTES[c.id]}
              className="ks-menu-cat-link"
              onClick={onClose}
            >
              <span className="ks-menu-cat-name">{c.label}</span>
            </Link>
          ))}
        </nav>
        <div className="ks-menu-divider" />
        <div className="ks-menu-links">
          <Link className="ks-menu-link" href="/contact">Contact</Link>
          <Link className="ks-menu-link" href="/info">Info</Link>
        </div>
        <div className="ks-menu-footer">
          <span>info@kshetejsareen.com</span>
        </div>
      </div>
    </div>
  )
}
