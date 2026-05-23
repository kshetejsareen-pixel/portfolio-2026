'use client'

import { categories } from '@/lib/categories'

const CATEGORY_ROUTES: Record<string, string> = {
  culinary:  '/culinary',
  spaces:    '/spaces',
  portraits: '/portraits',
  objects:   '/objects',
  motion:    '/motion',
}

export function KsMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`ks-menu-overlay${open ? ' open' : ''}`} aria-hidden={!open}>
      <button className="ks-menu-close-btn" onClick={onClose}>Close ×</button>
      <div className="ks-menu-inner">
        <div className="ks-menu-eyebrow">Navigation</div>
        <nav className="ks-menu-cats">
          {categories.map((c) => (
            <a
              key={c.id}
              href={CATEGORY_ROUTES[c.id]}
              className="ks-menu-cat-link"
              onClick={onClose}
            >
              <span className="ks-menu-cat-n">{c.n}</span>
              <span className="ks-menu-cat-name">{c.label}</span>
            </a>
          ))}
        </nav>
        <div className="ks-menu-divider" />
        <div className="ks-menu-links">
          <a className="ks-menu-link" href="/contact">Contact</a>
          <a className="ks-menu-link" href="/info">Info</a>
          <a className="ks-menu-link">Journal</a>
        </div>
        <div className="ks-menu-footer">info@kshetejsareen.com</div>
      </div>
    </div>
  )
}
