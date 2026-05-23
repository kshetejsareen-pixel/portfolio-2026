'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLandingSlots, GALLERY_SLOTS, PAGES, type Slot } from '@/lib/slots'
import { categories } from '@/lib/categories'

interface CloudinaryImage {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  created_at: string
  context?: { custom?: Record<string, string> }
}

interface Assignment {
  publicId: string
  url: string
  thumbnailUrl: string
}

type LandingConfig = Record<string, number>

const LANDING_CATS = [
  { id: 'culinary',  label: 'Culinary'  },
  { id: 'spaces',    label: 'Spaces'    },
  { id: 'portraits', label: 'Portraits' },
  { id: 'objects',   label: 'Objects'   },
  { id: 'motion',    label: 'Motion'    },
]

const MAX_FRAMES = 20

function thumb(url: string) {
  return url.replace('/upload/', '/upload/w_200,h_150,c_fill,q_auto/')
}

export function AdminPanel() {
  // ── Library state ────────────────────────────────────────────────────────
  const [images, setImages]         = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingImages, setLoadingImages] = useState(false)
  const [searchQ, setSearchQ]       = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Assignments + config ─────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({})
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    culinary: 4, spaces: 3, portraits: 5, objects: 3, motion: 2,
  })
  const [configSaving, setConfigSaving] = useState<string | null>(null)

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [activePage, setActivePage]     = useState('Landing')
  const [assigning, setAssigning]       = useState(false)
  const [toast, setToast]               = useState('')

  // ── Derived slots ────────────────────────────────────────────────────────
  const landingSlots = getLandingSlots(landingConfig)
  const pageSlots = activePage === 'Landing'
    ? landingSlots
    : GALLERY_SLOTS.filter((s) => s.page === activePage)

  // ── Fetch library ─────────────────────────────────────────────────────────
  const fetchImages = useCallback(async (q: string, cursor?: string) => {
    setLoadingImages(true)
    const params = new URLSearchParams()
    if (q)      params.set('q', q)
    if (cursor) params.set('cursor', cursor)
    const res  = await fetch(`/api/admin/images?${params}`)
    const data = await res.json()
    setImages((prev) => cursor ? [...prev, ...data.images] : data.images)
    setNextCursor(data.next_cursor ?? null)
    setLoadingImages(false)
  }, [])

  // ── Fetch assignments ─────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    const res  = await fetch('/api/admin/assignments')
    const data = await res.json()
    setAssignments(data.assignments ?? {})
  }, [])

  // ── Fetch landing config ───────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    const res  = await fetch('/api/admin/config')
    const data = await res.json()
    if (data.config) setLandingConfig(data.config)
  }, [])

  useEffect(() => {
    fetchImages('')
    fetchAssignments()
    fetchConfig()
  }, [fetchImages, fetchAssignments, fetchConfig])

  // ── Search debounce ───────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setImages([])
      setNextCursor(null)
      fetchImages(q)
    }, 400)
  }

  // ── Frame count controls ──────────────────────────────────────────────────
  const updateCount = async (catId: string, delta: number) => {
    const next = Math.max(1, Math.min(MAX_FRAMES, (landingConfig[catId] ?? 1) + delta))
    setLandingConfig((prev) => ({ ...prev, [catId]: next }))
    setConfigSaving(catId)
    await fetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: catId, count: next }),
    })
    setConfigSaving(null)
    showToast(`${catId} set to ${next} frame${next !== 1 ? 's' : ''}`)
  }

  // ── Assign image to slot ──────────────────────────────────────────────────
  const assignImage = async (img: CloudinaryImage) => {
    if (!selectedSlot) return
    setAssigning(true)
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: img.public_id, slotId: selectedSlot.id }),
    })
    if (res.ok) {
      await fetchAssignments()
      showToast(`Assigned to ${selectedSlot.label}`)
    } else {
      showToast('Error assigning image')
    }
    setAssigning(false)
    setSelectedSlot(null)
  }

  // ── Unassign slot ─────────────────────────────────────────────────────────
  const unassignSlot = async (slot: Slot) => {
    const asgn = assignments[slot.id]
    if (!asgn) return
    const res = await fetch('/api/admin/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: asgn.publicId }),
    })
    if (res.ok) {
      await fetchAssignments()
      showToast('Slot cleared')
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ── Landing slot groups (for the grouped display) ─────────────────────────
  const landingGroups = LANDING_CATS.map((cat) => {
    const count  = landingConfig[cat.id] ?? 0
    const slots  = landingSlots.filter((s) => s.id.startsWith(`landing-${cat.id}-`))
    const filled = slots.filter((s) => assignments[s.id]).length
    return { ...cat, count, slots, filled }
  })

  return (
    <div className="adm-root">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <span className="adm-sidebar-logo">KS · Admin</span>
          <a href="/" className="adm-sidebar-back" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
        </div>

        <nav className="adm-sidebar-nav">
          {PAGES.map((p) => (
            <button
              key={p}
              className={`adm-page-btn${activePage === p ? ' active' : ''}`}
              onClick={() => { setActivePage(p); setSelectedSlot(null) }}
            >
              {p}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <button
            className="adm-logout"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' })
              window.location.href = '/admin/login'
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* ── Slots panel ── */}
      <main className="adm-slots-panel">
        <div className="adm-slots-head">
          <div className="adm-slots-title">{activePage}</div>
          {selectedSlot && (
            <div className="adm-selecting-badge">
              Selecting for: <strong>{selectedSlot.label}</strong>
              <button className="adm-cancel-select" onClick={() => setSelectedSlot(null)}>Cancel ×</button>
            </div>
          )}
        </div>

        {/* Landing-specific: frame count controls */}
        {activePage === 'Landing' && (
          <div className="adm-frame-counts">
            <div className="adm-frame-counts-title">Landing page · frames per category</div>
            <div className="adm-frame-counts-table">
              {landingGroups.map((g) => (
                <div key={g.id} className="adm-frame-row">
                  <div className="adm-frame-row-label">{g.label}</div>
                  <div className="adm-frame-row-fill">
                    {g.filled} / {g.count} assigned
                    {g.filled < g.count && (
                      <span className="adm-frame-row-warn">· {g.count - g.filled} empty</span>
                    )}
                  </div>
                  <div className="adm-frame-row-controls">
                    <button
                      className="adm-count-btn"
                      onClick={() => updateCount(g.id, -1)}
                      disabled={g.count <= 1 || configSaving === g.id}
                    >−</button>
                    <span className={`adm-count-val${configSaving === g.id ? ' saving' : ''}`}>
                      {g.count}
                    </span>
                    <button
                      className="adm-count-btn"
                      onClick={() => updateCount(g.id, +1)}
                      disabled={g.count >= MAX_FRAMES || configSaving === g.id}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="adm-frame-counts-note">
              Changes take effect immediately on the live site.
              Reducing the count hides slots — assignments are preserved if you increase it again.
            </div>
          </div>
        )}

        {/* Slot grid — grouped by category for Landing */}
        {activePage === 'Landing' ? (
          <div className="adm-slots-scroll">
            {landingGroups.map((g) => (
              <div key={g.id} className="adm-cat-group">
                <div className="adm-cat-group-head">
                  <span className="adm-cat-group-name">{g.label}</span>
                  <span className="adm-cat-group-count">{g.count} frame{g.count !== 1 ? 's' : ''}</span>
                  <span className="adm-cat-group-status">
                    {g.filled === g.count ? '✓ all assigned' : `${g.filled}/${g.count} assigned`}
                  </span>
                </div>
                <div className="adm-slots-grid">
                  {g.slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      assignment={assignments[slot.id]}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                      onClear={() => unassignSlot(slot)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="adm-slots-grid adm-slots-grid--padded">
            {pageSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                assignment={assignments[slot.id]}
                selected={selectedSlot?.id === slot.id}
                onSelect={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                onClear={() => unassignSlot(slot)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Library panel ── */}
      <aside className="adm-library">
        <div className="adm-library-head">
          <div className="adm-library-title">Cloudinary Library</div>
          <input
            className="adm-library-search"
            type="search"
            placeholder="Search…"
            value={searchQ}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {selectedSlot && (
          <div className="adm-library-hint">
            Click an image to assign it to <strong>{selectedSlot.label}</strong>
          </div>
        )}

        <div className="adm-library-grid">
          {images.map((img) => (
            <button
              key={img.public_id}
              className={`adm-lib-img-btn${selectedSlot ? ' selectable' : ''}`}
              onClick={() => selectedSlot && assignImage(img)}
              title={img.public_id}
              disabled={assigning}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(img.secure_url)}
                alt={img.public_id}
                className="adm-lib-img"
                loading="lazy"
              />
              {img.context?.custom?.portfolio_slot && (
                <div className="adm-lib-assigned-badge" title={img.context.custom.portfolio_slot}>●</div>
              )}
            </button>
          ))}
        </div>

        {loadingImages && <div className="adm-library-loading">Loading…</div>}

        {nextCursor && !loadingImages && (
          <button
            className="adm-load-more"
            onClick={() => fetchImages(searchQ, nextCursor)}
          >
            Load more
          </button>
        )}
      </aside>

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}

// ── Slot card sub-component ─────────────────────────────────────────────────

function SlotCard({
  slot, assignment, selected, onSelect, onClear,
}: {
  slot: Slot
  assignment?: Assignment
  selected: boolean
  onSelect: () => void
  onClear: () => void
}) {
  return (
    <div className={`adm-slot${selected ? ' selecting' : ''}${assignment ? ' assigned' : ''}`}>
      {assignment ? (
        <div className="adm-slot-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assignment.thumbnailUrl} alt={slot.label} className="adm-slot-img" />
        </div>
      ) : (
        <div className="adm-slot-empty">
          <span className="adm-slot-empty-icon">+</span>
        </div>
      )}
      <div className="adm-slot-meta">
        <div className="adm-slot-label">{slot.label}</div>
        <div className="adm-slot-hint">{slot.hint}</div>
        <div className="adm-slot-actions">
          <button className="adm-slot-assign-btn" onClick={onSelect}>
            {selected ? 'Cancel' : assignment ? 'Replace' : 'Assign'}
          </button>
          {assignment && (
            <button className="adm-slot-clear-btn" onClick={onClear}>Clear</button>
          )}
        </div>
      </div>
    </div>
  )
}
