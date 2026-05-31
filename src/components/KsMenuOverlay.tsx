'use client'

import { useState, useEffect } from 'react'
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
          {orderedCats.map((c) => (
            <a
              key={c.id}
              href={CATEGORY_ROUTES[c.id]}
              className="ks-menu-cat-link"
              onClick={onClose}
            >
              <span className="ks-menu-cat-name">{c.label}</span>
            </a>
          ))}
        </nav>
        <div className="ks-menu-divider" />
        <div className="ks-menu-links">
          <a className="ks-menu-link" href="/">Home</a>
          <a className="ks-menu-link" href="/contact">Contact</a>
          <a className="ks-menu-link" href="/info">Info</a>
        </div>
        <div className="ks-menu-footer">
          <span>info@kshetejsareen.com</span>
          <a className="ks-menu-admin-link" href="/admin">Admin ↗</a>
        </div>
      </div>
    </div>
  )
}
