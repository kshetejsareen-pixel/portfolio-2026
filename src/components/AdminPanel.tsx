'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ALL_SLOTS, PAGES, type Slot } from '@/lib/slots'

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

export function AdminPanel() {
  // ── Library state ────────────────────────────────────────────────────────
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingImages, setLoadingImages] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Assignments state ────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({})

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [activePage, setActivePage] = useState('Landing')
  const [assigning, setAssigning] = useState(false)
  const [toast, setToast] = useState('')

  // ── Fetch library ────────────────────────────────────────────────────────
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

  // ── Fetch assignments ────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    const res  = await fetch('/api/admin/assignments')
    const data = await res.json()
    setAssignments(data.assignments ?? {})
  }, [])

  useEffect(() => {
    fetchImages('')
    fetchAssignments()
  }, [fetchImages, fetchAssignments])

  // ── Search debounce ──────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setImages([])
      setNextCursor(null)
      fetchImages(q)
    }, 400)
  }

  // ── Assign image to slot ─────────────────────────────────────────────────
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

  // ── Unassign slot ────────────────────────────────────────────────────────
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

  const pageSlots = ALL_SLOTS.filter((s) => s.page === activePage)

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
          <a
            className="adm-logout"
            href="/api/admin/logout"
            onClick={async (e) => {
              e.preventDefault()
              await fetch('/api/admin/logout', { method: 'POST' })
              window.location.href = '/admin/login'
            }}
          >
            Log out
          </a>
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

        <div className="adm-slots-grid">
          {pageSlots.map((slot) => {
            const asgn = assignments[slot.id]
            const active = selectedSlot?.id === slot.id
            return (
              <div
                key={slot.id}
                className={`adm-slot${active ? ' selecting' : ''}${asgn ? ' assigned' : ''}`}
              >
                {asgn ? (
                  <div className="adm-slot-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asgn.thumbnailUrl} alt={slot.label} className="adm-slot-img" />
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
                    <button
                      className="adm-slot-assign-btn"
                      onClick={() => setSelectedSlot(active ? null : slot)}
                    >
                      {active ? 'Cancel' : asgn ? 'Replace' : 'Assign'}
                    </button>
                    {asgn && (
                      <button
                        className="adm-slot-clear-btn"
                        onClick={() => unassignSlot(slot)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
                src={img.secure_url.replace('/upload/', '/upload/w_200,h_150,c_fill,q_auto/')}
                alt={img.public_id}
                className="adm-lib-img"
                loading="lazy"
              />
              {img.context?.custom?.portfolio_slot && (
                <div className="adm-lib-assigned-badge" title={img.context.custom.portfolio_slot}>
                  ●
                </div>
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

      {/* ── Toast ── */}
      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}
