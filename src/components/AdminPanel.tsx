'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLandingSlots, GALLERY_SLOTS, PAGES, type Slot } from '@/lib/slots'
import { categories } from '@/lib/categories'
import { PROJECT_TAGS } from '@/lib/tags'
import { FocalPointEditor } from '@/components/FocalPointEditor'
import {
  culinaryData, spacesData, portraitsData, objectsData, motionData,
  type IntroPart,
} from '@/lib/categoryData'
import type { InfoCopy, ContactCopy } from '@/lib/copyConfig'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CloudinaryImage {
  public_id: string
  secure_url: string
  width: number
  height: number
  context?: { custom?: Record<string, string> }
}

interface Assignment {
  publicId: string
  url: string
  thumbnailUrl: string
  focalX?: number
  focalY?: number
  angle?: 0 | 90 | 180 | 270
  flipH?: boolean
  flipV?: boolean
  title?: string
  location?: string
  year?: string
  camera?: string
  width?: number
  height?: number
}

interface ImageCopy {
  title: string
  location: string
  year: string
  camera: string
}

interface CloudinaryFolder {
  name: string
  path: string
  imageCount: number
}

interface AdminProject {
  id: string
  folder: string
  title: string
  it?: string
  year: string
  location: string
  desc?: string
  coverId?: string
  coverFocalX?: number
  coverFocalY?: number
  imageCount?: number
  coverUrl?: string | null
  tags?: string[]
  hiddenImages?: string[]
}

type LandingConfig = Record<string, number>

interface TextStyle {
  font?: 'serif' | 'mono' | 'sans'
  size?: number
  italic?: boolean
  bold?: boolean
}

interface CategoryCopy {
  introLabel?: string
  introBody?: string
  pullQuoteText?: string
  pullQuoteAttr?: string
  heroTitle?: string
  projectsSectionTitle?: string
  heroTitleStyle?: TextStyle
  introLabelStyle?: TextStyle
  introBodyStyle?: TextStyle
  pullQuoteStyle?: TextStyle
  pullQuoteAttrStyle?: TextStyle
}

type RightPanel =
  | { mode: 'library' }
  | { mode: 'copy-editor'; slotId: string; publicId: string; initial: ImageCopy }
  | { mode: 'focal-point'; slotId: string; imageUrl: string; focalX?: number; focalY?: number }
  | { mode: 'folder-browser'; categoryId: string }
  | { mode: 'page-copy'; categoryId: string }
  | { mode: 'project-images'; categoryId: string; project: AdminProject }
  | { mode: 'project-cover-focal'; categoryId: string; project: AdminProject }
  | { mode: 'project-edit'; categoryId: string; project: AdminProject }

// ─── Constants ────────────────────────────────────────────────────────────────

const LANDING_CATS = [
  { id: 'culinary',  label: 'Culinary'  },
  { id: 'spaces',    label: 'Spaces'    },
  { id: 'portraits', label: 'Portraits' },
  { id: 'objects',   label: 'Objects'   },
  { id: 'motion',    label: 'Motion'    },
]
const MAX_FRAMES = 20
const CAT_IDS = ['culinary', 'spaces', 'portraits', 'objects', 'motion']

function thumb(url: string) {
  return url.replace('/upload/', '/upload/w_200,h_150,c_fill,q_auto/')
}

function extractPublicId(input: string): string {
  const s = input.trim()
  if (!s.startsWith('http')) return s
  const m = s.match(/\/upload\/(?:v\d+\/)?(.+)$/)
  if (!m) return s
  return m[1].replace(/\.[^/.]+$/, '')
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminPanel() {
  // Library
  const [images, setImages]             = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor]     = useState<string | null>(null)
  const [loadingImages, setLoadingImages] = useState(false)
  const [searchQ, setSearchQ]           = useState('')
  const [libraryFolder, setLibraryFolder] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Assignments + config
  const [assignments, setAssignments]   = useState<Record<string, Assignment>>({})
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    culinary: 4, spaces: 3, portraits: 5, objects: 3, motion: 2,
  })
  const [configSaving, setConfigSaving] = useState<string | null>(null)

  // Projects
  const [projects, setProjects]         = useState<Record<string, AdminProject[]>>({})

  // Page copy
  const [copyCfg, setCopyCfg]           = useState<Record<string, Record<string, unknown>>>({})

  // Category order
  const [catOrder, setCatOrder] = useState<string[]>(['culinary', 'spaces', 'portraits', 'objects', 'motion'])
  const [orderSaving, setOrderSaving] = useState(false)

  // Selection / panel state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [activePage, setActivePage]     = useState('Landing')
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null)
  const [rightPanel, setRightPanel]     = useState<RightPanel>({ mode: 'library' })
  const [toast, setToast]               = useState('')

  // Derived
  const landingSlots  = getLandingSlots(landingConfig)
  const pageSlots     = activePage === 'Landing'
    ? landingSlots
    : GALLERY_SLOTS.filter((s) => s.page === activePage)
  const activeCatId   = activePage.toLowerCase()

  // ── Fetch library ──────────────────────────────────────────────────────────
  const [libraryError, setLibraryError] = useState('')

  const fetchImages = useCallback(async (q: string, cursor?: string, folder = '') => {
    setLoadingImages(true)
    setLibraryError('')
    try {
      const params = new URLSearchParams()
      if (q)      params.set('q', q)
      if (folder) params.set('folder', folder)
      if (cursor) params.set('cursor', cursor)
      const data = await fetch(`/api/admin/images?${params}`).then((r) => r.json())
      if (data.error) { setLibraryError(data.error); setLoadingImages(false); return }
      setImages((prev) => cursor ? [...prev, ...(data.images ?? [])] : (data.images ?? []))
      setNextCursor(data.next_cursor ?? null)
    } catch {
      setLibraryError('Network error — could not reach Cloudinary')
    } finally {
      setLoadingImages(false)
    }
  }, [])

  // ── Fetch assignments ──────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    const data = await fetch('/api/admin/assignments').then((r) => r.json())
    const mapped: Record<string, Assignment> = {}
    for (const [id, asgn] of Object.entries(data.assignments ?? {})) {
      const a = asgn as Assignment
      mapped[id] = { publicId: a.publicId, url: a.url, thumbnailUrl: a.thumbnailUrl, focalX: a.focalX, focalY: a.focalY, angle: a.angle, flipH: a.flipH, flipV: a.flipV, title: a.title, location: a.location, year: a.year, camera: a.camera, width: a.width, height: a.height }
    }
    setAssignments(mapped)
  }, [])

  // ── Fetch landing config + category order ─────────────────────────────────
  const fetchConfig = useCallback(async () => {
    const data = await fetch('/api/admin/config').then((r) => r.json())
    if (data.config) setLandingConfig(data.config)
    if (data.categoryOrder) setCatOrder(data.categoryOrder)
  }, [])

  // ── Fetch projects ─────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    const data = await fetch('/api/admin/projects').then((r) => r.json())
    if (data.projects) setProjects(data.projects)
  }, [])

  // ── Reorder projects ───────────────────────────────────────────────────────
  const moveProject = async (catId: string, projectId: string, dir: 'up' | 'down') => {
    const arr = [...(projects[catId] ?? [])]
    const idx = arr.findIndex((p) => p.id === projectId)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (idx === -1 || swapIdx < 0 || swapIdx >= arr.length) return
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    setProjects((prev) => ({ ...prev, [catId]: arr }))
    await fetch('/api/admin/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: catId, reorderedProjects: arr }),
    })
  }

  // ── Reorder categories ─────────────────────────────────────────────────────
  const moveCat = async (catId: string, dir: 'up' | 'down') => {
    const arr = [...catOrder]
    const idx = arr.indexOf(catId)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (idx === -1 || swapIdx < 0 || swapIdx >= arr.length) return
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    setCatOrder(arr)
    setOrderSaving(true)
    await fetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'order', order: arr }),
    })
    setOrderSaving(false)
    showToast('Category order saved')
  }

  // ── Fetch page copy config ─────────────────────────────────────────────────
  const fetchCopyCfg = useCallback(async () => {
    const data = await fetch('/api/admin/copy').then((r) => r.json())
    if (data.copy) setCopyCfg(data.copy)
  }, [])

  useEffect(() => {
    fetchImages('')
    fetchAssignments()
    fetchConfig()
    fetchProjects()
    fetchCopyCfg()
  }, [fetchImages, fetchAssignments, fetchConfig, fetchProjects, fetchCopyCfg])

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setImages([])
      setNextCursor(null)
      fetchImages(q, undefined, q ? '' : libraryFolder)
    }, 400)
  }

  // ── Folder navigation ──────────────────────────────────────────────────────
  const handleFolderChange = useCallback((folder: string) => {
    setLibraryFolder(folder)
    setSearchQ('')
    setImages([])
    setNextCursor(null)
    fetchImages('', undefined, folder)
  }, [fetchImages])

  // ── Frame count controls ───────────────────────────────────────────────────
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
    showToast(`${catId} — ${next} frame${next !== 1 ? 's' : ''}`)
  }

  // ── Assign image to slot ───────────────────────────────────────────────────
  const assignImage = async (img: CloudinaryImage) => {
    if (!selectedSlot) return
    const slot = selectedSlot
    setSelectedSlot(null)
    setAssigningSlotId(slot.id)
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: img.public_id, slotId: slot.id }),
    })
    if (res.ok) {
      // Optimistic update — Cloudinary search index lags behind; don't re-fetch
      setAssignments((prev) => ({
        ...prev,
        [slot.id]: {
          publicId: img.public_id,
          url: img.secure_url,
          thumbnailUrl: thumb(img.secure_url),
        },
      }))
      showToast(`Assigned to ${slot.label}`)
    } else {
      showToast('Error assigning image')
    }
    setAssigningSlotId(null)
  }

  // ── Assign by public_id or URL ─────────────────────────────────────────────
  const assignByPublicId = async (rawInput: string) => {
    if (!selectedSlot) return
    const publicId = extractPublicId(rawInput)
    if (!publicId) { showToast('Invalid URL or public ID'); return }
    const slot = selectedSlot
    setSelectedSlot(null)
    setAssigningSlotId(slot.id)
    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, slotId: slot.id }),
    })
    if (res.ok) {
      const baseUrl = `https://res.cloudinary.com/dsouvrzlr/image/upload/${publicId}`
      setAssignments((prev) => ({
        ...prev,
        [slot.id]: {
          publicId,
          url: baseUrl,
          thumbnailUrl: baseUrl.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/'),
        },
      }))
      showToast(`Assigned to ${slot.label}`)
    } else {
      showToast('Error — check the URL or public ID')
    }
    setAssigningSlotId(null)
  }

  // ── Swap slot assignments (reorder) ───────────────────────────────────────
  const swapSlots = async (slotA: string, slotB: string) => {
    setAssignments((prev) => {
      const next = { ...prev }
      const a = prev[slotA]
      const b = prev[slotB]
      if (a) next[slotB] = a; else delete next[slotB]
      if (b) next[slotA] = b; else delete next[slotA]
      return next
    })
    await fetch('/api/admin/assign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotA, slotB }),
    })
    showToast(`Reordered`)
  }

  // ── Unassign slot ──────────────────────────────────────────────────────────
  const unassignSlot = async (slot: Slot) => {
    const asgn = assignments[slot.id]
    if (!asgn) return
    setAssigningSlotId(slot.id)
    await fetch('/api/admin/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: asgn.publicId, slotId: slot.id }),
    })
    // Optimistic remove
    setAssignments((prev) => {
      const next = { ...prev }
      delete next[slot.id]
      return next
    })
    setAssigningSlotId(null)
    showToast('Slot cleared')
  }

  // ── Transform (rotate / flip) ──────────────────────────────────────────────
  const CLOUD_NAME = 'dsouvrzlr'

  function buildTransformStr(angle?: number, flipH?: boolean, flipV?: boolean): string {
    const parts: string[] = []
    if (flipH) parts.push('a_hflip')
    if (flipV) parts.push('a_vflip')
    if (angle && angle !== 0) parts.push(`a_${angle}`)
    return parts.join('/')
  }

  function buildDisplayUrl(asgn: Assignment): string {
    const t = buildTransformStr(asgn.angle, asgn.flipH, asgn.flipV)
    const mid = t ? `${t}/` : ''
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${mid}f_auto,q_auto,w_2400/${asgn.publicId}`
  }

  const handleTransform = async (slot: Slot, action: 'cw' | 'ccw' | 'flipH' | 'flipV') => {
    const asgn = assignments[slot.id]
    if (!asgn) return

    let angle  = (asgn.angle  ?? 0) as 0 | 90 | 180 | 270
    let flipH  = asgn.flipH ?? false
    let flipV  = asgn.flipV ?? false

    if (action === 'cw')    angle  = ((angle + 90)  % 360) as 0 | 90 | 180 | 270
    if (action === 'ccw')   angle  = ((angle + 270) % 360) as 0 | 90 | 180 | 270
    if (action === 'flipH') flipH  = !flipH
    if (action === 'flipV') flipV  = !flipV

    const t    = buildTransformStr(angle, flipH, flipV)
    const mid  = t ? `${t}/` : ''
    const newThumb = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${mid}w_400,h_300,c_fill,q_auto,f_auto/${asgn.publicId}`

    setAssignments((prev) => ({
      ...prev,
      [slot.id]: { ...asgn, angle, flipH, flipV, thumbnailUrl: newThumb },
    }))

    await fetch('/api/admin/assign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: slot.id, angle, flipH, flipV, type: 'transform' }),
    })
    showToast('Transform saved')
  }

  // ── Open copy editor ───────────────────────────────────────────────────────
  const openCopyEditor = (slot: Slot) => {
    const asgn = assignments[slot.id]
    if (!asgn) return
    // Use copy cached in assignments state (from Firestore — authoritative and always fresh)
    // Fall back to static categories.ts frame data for frames that have never been edited
    const cat  = categories.find((c) => slot.id.startsWith(`landing-${c.id}-`))
    const idx  = parseInt(slot.id.split('-').pop() ?? '0', 10)
    const base = cat?.frames[idx]
    setRightPanel({
      mode: 'copy-editor',
      slotId: slot.id,
      publicId: asgn.publicId,
      initial: {
        title:    asgn.title    || base?.title    || '',
        location: asgn.location || base?.location || '',
        year:     asgn.year     || base?.year     || '',
        camera:   asgn.camera   || base?.camera   || '',
      },
    })
    setSelectedSlot(null)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const orderedLandingCats = [...LANDING_CATS].sort((a, b) => {
    const ai = catOrder.indexOf(a.id)
    const bi = catOrder.indexOf(b.id)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const landingGroups = orderedLandingCats.map((cat) => {
    const count  = landingConfig[cat.id] ?? 0
    const slots  = landingSlots.filter((s) => s.id.startsWith(`landing-${cat.id}-`))
    const filled = slots.filter((s) => assignments[s.id]).length
    return { ...cat, count, slots, filled }
  })

  return (
    <div className="adm-root">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
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
              onClick={() => {
                setActivePage(p)
                setSelectedSlot(null)
                setRightPanel({ mode: 'library' })
              }}
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

      {/* ── Slots panel ──────────────────────────────────────────────────── */}
      <main className="adm-slots-panel">
        <div className="adm-slots-head">
          <div className="adm-slots-title">{activePage}</div>
          {activePage !== 'Landing' && (CAT_IDS.includes(activeCatId) || activePage === 'Info' || activePage === 'Contact') && (
            <button
              className={`adm-page-copy-btn${rightPanel.mode === 'page-copy' && rightPanel.categoryId === activeCatId ? ' active' : ''}`}
              onClick={() => setRightPanel(
                rightPanel.mode === 'page-copy' && rightPanel.categoryId === activeCatId
                  ? { mode: 'library' }
                  : { mode: 'page-copy', categoryId: activeCatId }
              )}
            >
              Edit page copy
            </button>
          )}
          {selectedSlot && (
            <div className="adm-selecting-badge">
              Selecting for: <strong>{selectedSlot.label}</strong>
              <button className="adm-cancel-select" onClick={() => setSelectedSlot(null)}>Cancel ×</button>
            </div>
          )}
        </div>

        {/* Category order — Landing only */}
        {activePage === 'Landing' && (
          <div className="adm-frame-counts">
            <div className="adm-frame-counts-title">
              Category order
              {orderSaving && <span className="adm-count-saving"> saving…</span>}
            </div>
            <div className="adm-frame-counts-table">
              {catOrder.map((id, i) => {
                const cat = LANDING_CATS.find((c) => c.id === id)
                if (!cat) return null
                return (
                  <div key={id} className="adm-frame-row">
                    <div className="adm-frame-row-label">
                      <span className="adm-cat-order-n">{String(i + 1).padStart(2, '0')}</span>
                      {cat.label}
                    </div>
                    <div className="adm-frame-row-controls">
                      <button className="adm-count-btn" onClick={() => moveCat(id, 'up')}   disabled={i === 0 || orderSaving}>↑</button>
                      <button className="adm-count-btn" onClick={() => moveCat(id, 'down')} disabled={i === catOrder.length - 1 || orderSaving}>↓</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="adm-frame-counts-note">
              Order applies to the landing page carousel and the navigation menu.
            </div>
          </div>
        )}

        {/* Frame count controls — Landing only */}
        {activePage === 'Landing' && (
          <div className="adm-frame-counts">
            <div className="adm-frame-counts-title">Landing page · frames per category</div>
            <div className="adm-frame-counts-table">
              {landingGroups.map((g) => (
                <div key={g.id} className="adm-frame-row">
                  <div className="adm-frame-row-label">{g.label}</div>
                  <div className="adm-frame-row-fill">
                    {g.filled}/{g.count} assigned
                    {g.filled < g.count && <span className="adm-frame-row-warn"> · {g.count - g.filled} empty</span>}
                  </div>
                  <div className="adm-frame-row-controls">
                    <button className="adm-count-btn" onClick={() => updateCount(g.id, -1)} disabled={g.count <= 1 || configSaving === g.id}>−</button>
                    <span className={`adm-count-val${configSaving === g.id ? ' saving' : ''}`}>{g.count}</span>
                    <button className="adm-count-btn" onClick={() => updateCount(g.id, +1)} disabled={g.count >= MAX_FRAMES || configSaving === g.id}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="adm-frame-counts-note">
              Changes take effect immediately. Reducing count hides slots — assignments are preserved if you increase it again.
            </div>
          </div>
        )}

        {/* Projects section — category pages only */}
        {activePage !== 'Landing' && CAT_IDS.includes(activeCatId) && (
          <ProjectsSection
            categoryId={activeCatId}
            projects={projects[activeCatId] ?? []}
            onAdd={() => setRightPanel({ mode: 'folder-browser', categoryId: activeCatId })}
            onRemove={async (projectId) => {
              await fetch('/api/admin/projects', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: activeCatId, projectId }),
              })
              await fetchProjects()
              showToast('Project removed')
            }}
            onManageImages={(project) =>
              setRightPanel({ mode: 'project-images', categoryId: activeCatId, project })
            }
            onSetCoverFocal={(project) =>
              setRightPanel({ mode: 'project-cover-focal', categoryId: activeCatId, project })
            }
            onMoveUp={(projectId) => moveProject(activeCatId, projectId, 'up')}
            onMoveDown={(projectId) => moveProject(activeCatId, projectId, 'down')}
            onEdit={(project) => setRightPanel({ mode: 'project-edit', categoryId: activeCatId, project })}
          />
        )}

        {/* Slot grid */}
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
                  {g.slots.map((slot, i) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      assignment={assignments[slot.id]}
                      selected={selectedSlot?.id === slot.id}
                      assigningThis={assigningSlotId === slot.id}
                      onSelect={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                      onClear={() => unassignSlot(slot)}
                      onEditCopy={() => openCopyEditor(slot)}
                      onSetFocus={() => {
                        const asgn = assignments[slot.id]
                        if (!asgn) return
                        setRightPanel({ mode: 'focal-point', slotId: slot.id, imageUrl: buildDisplayUrl(asgn), focalX: asgn.focalX, focalY: asgn.focalY })
                        setSelectedSlot(null)
                      }}
                      onTransform={(action) => handleTransform(slot, action)}
                      onMoveUp={i > 0 ? () => swapSlots(slot.id, g.slots[i - 1].id) : undefined}
                      onMoveDown={i < g.slots.length - 1 ? () => swapSlots(slot.id, g.slots[i + 1].id) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (() => {
          const heroSlots    = pageSlots.filter((s) => s.id.endsWith('-hero'))
          const gallerySlots = pageSlots.filter((s) => !s.id.endsWith('-hero'))
          // Only assigned slots participate in reordering — arrows skip empty gaps
          const assignedGallery = gallerySlots.filter((s) => assignments[s.id])
          const renderCard = (slot: Slot) => {
            const asgn = assignments[slot.id]
            const ai   = assignedGallery.findIndex((s) => s.id === slot.id)
            const prevAssigned = ai > 0 ? assignedGallery[ai - 1] : undefined
            const nextAssigned = ai >= 0 && ai < assignedGallery.length - 1 ? assignedGallery[ai + 1] : undefined
            return (
              <SlotCard
                key={slot.id}
                slot={slot}
                assignment={asgn}
                selected={selectedSlot?.id === slot.id}
                assigningThis={assigningSlotId === slot.id}
                onSelect={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                onClear={() => unassignSlot(slot)}
                onEditCopy={() => openCopyEditor(slot)}
                onSetFocus={() => {
                  if (!asgn) return
                  setRightPanel({ mode: 'focal-point', slotId: slot.id, imageUrl: buildDisplayUrl(asgn), focalX: asgn.focalX, focalY: asgn.focalY })
                  setSelectedSlot(null)
                }}
                onTransform={(action) => handleTransform(slot, action)}
                onViewLink={asgn
                  ? () => window.open(`https://res.cloudinary.com/dsouvrzlr/image/upload/${asgn.publicId}`, '_blank')
                  : undefined}
                onMoveUp={asgn && prevAssigned ? () => swapSlots(slot.id, prevAssigned.id) : undefined}
                onMoveDown={asgn && nextAssigned ? () => swapSlots(slot.id, nextAssigned.id) : undefined}
              />
            )
          }
          if (pageSlots.length === 0) {
            return (
              <div className="adm-slots-scroll">
                <div className="adm-cat-section">
                  <div className="adm-cat-section-head">
                    <span className="adm-cat-section-title">No image slots</span>
                    <span className="adm-cat-section-desc">Use &quot;Edit page copy&quot; above to manage text content for this page</span>
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div className="adm-slots-scroll adm-slots-scroll--cat">
              {heroSlots.length > 0 && (
                <div className="adm-cat-section">
                  <div className="adm-cat-section-head">
                    <span className="adm-cat-section-title">Hero Banner</span>
                    <span className="adm-cat-section-desc">Full-bleed background behind the category title</span>
                  </div>
                  <div className="adm-slots-grid">
                    {heroSlots.map((slot) => renderCard(slot))}
                  </div>
                </div>
              )}
              <div className="adm-cat-section">
                <div className="adm-cat-section-head">
                  <span className="adm-cat-section-title">Gallery Frames</span>
                  <span className="adm-cat-section-desc">{gallerySlots.filter((s) => assignments[s.id]).length} / {gallerySlots.length} assigned</span>
                </div>
                <div className="adm-slots-grid">
                  {gallerySlots.map((slot) => renderCard(slot))}
                </div>
              </div>
            </div>
          )
        })()}
      </main>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      {rightPanel.mode === 'focal-point' ? (
        <FocalPointEditor
          key={rightPanel.slotId}
          slotId={rightPanel.slotId}
          imageUrl={rightPanel.imageUrl}
          initialX={rightPanel.focalX}
          initialY={rightPanel.focalY}
          onSave={async (focalX, focalY) => {
            await fetch('/api/admin/assign', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slotId: rightPanel.slotId, focalX, focalY }),
            })
            setAssignments((prev) => {
              const asgn = prev[rightPanel.slotId]
              if (!asgn) return prev
              return { ...prev, [rightPanel.slotId]: { ...asgn, focalX, focalY } }
            })
            showToast('Focal point saved')
            setRightPanel({ mode: 'library' })
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'copy-editor' ? (
        <CopyEditorPanel
          key={rightPanel.slotId}
          publicId={rightPanel.publicId}
          initial={rightPanel.initial}
          onSave={async (copy) => {
            const res = await fetch('/api/admin/image-meta', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: rightPanel.publicId, ...copy }),
            })
            if (res.ok) {
              // Update local assignments state so reopening the editor shows fresh values
              setAssignments((prev) => {
                const asgn = prev[rightPanel.slotId]
                if (!asgn) return prev
                return { ...prev, [rightPanel.slotId]: { ...asgn, ...copy } }
              })
              showToast('Copy saved')
              setRightPanel({ mode: 'library' })
            } else {
              showToast('Error saving copy — please try again')
            }
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'folder-browser' ? (
        <FolderBrowserPanel
          categoryId={rightPanel.categoryId}
          onAdd={async (project) => {
            await fetch('/api/admin/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categoryId: rightPanel.categoryId, project }),
            })
            await fetchProjects()
            showToast(`Added "${project.title}"`)
            setRightPanel({ mode: 'library' })
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'page-copy' ? (
        <PageCopyEditorPanel
          key={rightPanel.categoryId}
          categoryId={rightPanel.categoryId}
          initial={
            CAT_IDS.includes(rightPanel.categoryId)
              ? ({ ...(CATEGORY_DEFAULTS[rightPanel.categoryId] ?? {}), ...(copyCfg[rightPanel.categoryId] ?? {}) } as Record<string, unknown>)
              : (copyCfg[rightPanel.categoryId] ?? {})
          }
          onSave={async (copy) => {
            await fetch('/api/admin/copy', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categoryId: rightPanel.categoryId, updates: copy }),
            })
            setCopyCfg((prev) => ({ ...prev, [rightPanel.categoryId]: copy }))
            showToast('Page copy saved')
          }}
          onClose={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'project-edit' ? (
        <ProjectEditPanel
          key={rightPanel.project.id}
          project={rightPanel.project}
          onSave={async (updates) => {
            await fetch('/api/admin/projects', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categoryId: rightPanel.categoryId, projectId: rightPanel.project.id, updates }),
            })
            await fetchProjects()
            showToast('Project updated')
            setRightPanel({ mode: 'library' })
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'project-cover-focal' ? (
        <FocalPointEditor
          key={`proj-cover-${rightPanel.project.id}`}
          slotId={`proj-cover-${rightPanel.project.id}`}
          imageUrl={rightPanel.project.coverId
            ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto,w_2400/${rightPanel.project.coverId}`
            : (rightPanel.project.coverUrl ?? '')}
          initialX={rightPanel.project.coverFocalX}
          initialY={rightPanel.project.coverFocalY}
          onSave={async (coverFocalX, coverFocalY) => {
            await fetch('/api/admin/projects', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categoryId: rightPanel.categoryId,
                projectId: rightPanel.project.id,
                updates: { coverFocalX, coverFocalY },
              }),
            })
            await fetchProjects()
            showToast('Cover focal point saved')
            setRightPanel({ mode: 'library' })
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : rightPanel.mode === 'project-images' ? (
        <ProjectImagesPanel
          key={rightPanel.project.id}
          project={rightPanel.project}
          categoryId={rightPanel.categoryId}
          onSave={async (hiddenImages, coverId) => {
            await fetch('/api/admin/projects', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categoryId: rightPanel.categoryId,
                projectId: rightPanel.project.id,
                updates: { hiddenImages, coverId },
              }),
            })
            await fetchProjects()
            showToast('Image visibility saved')
            setRightPanel({ mode: 'library' })
          }}
          onCancel={() => setRightPanel({ mode: 'library' })}
        />
      ) : (
        <LibraryPanel
          images={images}
          nextCursor={nextCursor}
          loadingImages={loadingImages}
          error={libraryError}
          searchQ={searchQ}
          selectedSlot={selectedSlot}
          assigning={assigningSlotId !== null}
          currentFolder={libraryFolder}
          onSearch={handleSearch}
          onFolderChange={handleFolderChange}
          onSelectImage={assignImage}
          onAssignUrl={assignByPublicId}
          onLoadMore={() => fetchImages(searchQ, nextCursor ?? undefined, libraryFolder)}
        />
      )}

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}

// ─── SlotCard ─────────────────────────────────────────────────────────────────

function SlotCard({
  slot, assignment, selected, assigningThis, onSelect, onClear, onEditCopy, onSetFocus, onTransform, onViewLink, onMoveUp, onMoveDown,
}: {
  slot: Slot
  assignment?: Assignment
  selected: boolean
  assigningThis: boolean
  onSelect: () => void
  onClear: () => void
  onEditCopy: () => void
  onSetFocus: () => void
  onTransform: (action: 'cw' | 'ccw' | 'flipH' | 'flipV') => void
  onViewLink?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  return (
    <div className={`adm-slot${selected ? ' selecting' : ''}${assignment ? ' assigned' : ''}${assigningThis ? ' assigning' : ''}`}>
      {assigningThis ? (
        <div className="adm-slot-pending">
          <div className="adm-slot-spinner" />
          <div className="adm-slot-pending-label">Saving…</div>
        </div>
      ) : assignment ? (
        <div className="adm-slot-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assignment.thumbnailUrl} alt={slot.label} className="adm-slot-img" />
        </div>
      ) : (
        <div className="adm-slot-empty" onClick={onSelect} style={{ cursor: 'pointer' }}>
          <span className="adm-slot-empty-icon">{selected ? '×' : '+'}</span>
        </div>
      )}
      <div className="adm-slot-meta">
        <div className="adm-slot-label">{slot.label}</div>
        {assignment && (assignment.title || assignment.location) ? (
          <div className="adm-slot-copy-preview">
            {[assignment.title, assignment.location, assignment.year].filter(Boolean).join(' · ')}
          </div>
        ) : (
          <div className="adm-slot-hint">{!assignment && !assigningThis ? 'Click to select, then pick from library' : slot.hint}</div>
        )}
        {getFrameDims(slot.id) && (
          <div className="adm-slot-dims">{getFrameDims(slot.id)}</div>
        )}
        {/* Row 1: primary action + clear */}
        <div className="adm-slot-actions">
          <button className="adm-slot-assign-btn" onClick={onSelect} disabled={assigningThis}>
            {selected ? 'Cancel' : assignment ? 'Replace' : 'Assign'}
          </button>
          {assignment && !assigningThis && (
            <button className="adm-slot-clear-btn" onClick={onClear}>Clear</button>
          )}
        </div>
        {/* Row 2: icon utilities */}
        {assignment && !assigningThis && (
          <div className="adm-slot-icons">
            {onViewLink && (
              <button className="adm-slot-link-btn" onClick={onViewLink} title="Open in Cloudinary">↗</button>
            )}
            <button className="adm-slot-copy-btn" onClick={onEditCopy} title="Edit copy">✏</button>
            <button className="adm-slot-focus-btn" onClick={onSetFocus} title="Set focal point">⊙</button>
          </div>
        )}
        {/* Row 3: transform */}
        {assignment && !assigningThis && (
          <div className="adm-slot-transform">
            <button className="adm-slot-xfm-btn" onClick={() => onTransform('ccw')} title="Rotate 90° CCW">↺</button>
            <button className="adm-slot-xfm-btn" onClick={() => onTransform('cw')}  title="Rotate 90° CW">↻</button>
            <button className="adm-slot-xfm-btn" onClick={() => onTransform('flipH')} title="Flip horizontal">↔</button>
            <button className="adm-slot-xfm-btn" onClick={() => onTransform('flipV')} title="Flip vertical">↕</button>
          </div>
        )}
        {/* Row 4: order */}
        {(onMoveUp !== undefined || onMoveDown !== undefined) && (
          <div className="adm-slot-order">
            <button className="adm-slot-order-btn" onClick={onMoveUp} disabled={!onMoveUp} title="Move up">↑</button>
            <button className="adm-slot-order-btn" onClick={onMoveDown} disabled={!onMoveDown} title="Move down">↓</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CopyEditorPanel ──────────────────────────────────────────────────────────

function CopyEditorPanel({
  publicId, initial, onSave, onCancel,
}: {
  publicId: string
  initial: ImageCopy
  onSave: (copy: ImageCopy) => Promise<void>
  onCancel: () => void
}) {
  const [copy, setCopy]   = useState<ImageCopy>(initial)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof ImageCopy) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCopy((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(copy)
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-copy-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Edit copy</div>
        <div className="adm-copy-pubid">{publicId.split('/').pop()}</div>
      </div>

      <div className="adm-copy-format-note">
        <div className="adm-copy-format-title">Standardized format</div>
        <div className="adm-copy-format-preview">
          <span className="adm-copy-preview-title">{copy.title || 'Title'}</span>
          <span className="adm-copy-preview-meta">
            {[copy.location, copy.year].filter(Boolean).join(' · ') || 'Location · Year'}
          </span>
          {copy.camera && <span className="adm-copy-preview-camera">{copy.camera}</span>}
        </div>
      </div>

      <div className="adm-copy-fields">
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Title
            <span className="adm-copy-hint">e.g. Stone fruit, late summer</span>
          </label>
          <input className="adm-copy-input" value={copy.title} onChange={set('title')} placeholder="Subject or title" />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Location
            <span className="adm-copy-hint">e.g. Sant Yago, Mallorca</span>
          </label>
          <input className="adm-copy-input" value={copy.location} onChange={set('location')} placeholder="Venue, City" />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Year
            <span className="adm-copy-hint">e.g. 2025</span>
          </label>
          <input className="adm-copy-input" value={copy.year} onChange={set('year')} placeholder="YYYY" maxLength={4} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Camera
            <span className="adm-copy-hint">e.g. Phase One · 80mm</span>
          </label>
          <input className="adm-copy-input" value={copy.camera} onChange={set('camera')} placeholder="Body · Focal length" />
        </div>
      </div>

      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onCancel}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save copy →'}
        </button>
      </div>
    </aside>
  )
}

// ─── ProjectsSection ──────────────────────────────────────────────────────────

function ProjectsSection({
  categoryId, projects, onAdd, onRemove, onManageImages, onSetCoverFocal, onMoveUp, onMoveDown, onEdit,
}: {
  categoryId: string
  projects: AdminProject[]
  onAdd: () => void
  onRemove: (id: string) => void
  onManageImages: (project: AdminProject) => void
  onSetCoverFocal: (project: AdminProject) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onEdit: (project: AdminProject) => void
}) {
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const usedTagIds = [...new Set(projects.flatMap((p) => p.tags ?? []))]
  const usedTags = PROJECT_TAGS.filter((t) => usedTagIds.includes(t.id))
  const filtered = filterTag ? projects.filter((p) => p.tags?.includes(filterTag)) : projects

  return (
    <div className="adm-projects-section">
      <div className="adm-projects-head">
        <div className="adm-projects-title">
          Projects
          <span className="adm-projects-count">{projects.length}</span>
        </div>
        <button className="adm-projects-add-btn" onClick={onAdd}>
          + Add from Cloudinary folder
        </button>
      </div>

      {usedTags.length > 0 && (
        <div className="adm-tag-filter">
          <button
            className={`adm-tag-filter-btn${filterTag === null ? ' active' : ''}`}
            onClick={() => setFilterTag(null)}
          >
            All
          </button>
          {usedTags.map((t) => (
            <button
              key={t.id}
              className={`adm-tag-pill adm-tag-filter-btn${filterTag === t.id ? ' active' : ''}`}
              style={{ '--tag-color': t.color } as React.CSSProperties}
              onClick={() => setFilterTag(filterTag === t.id ? null : t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="adm-projects-empty">
          {projects.length === 0
            ? 'No projects yet. Add a Cloudinary folder to create one.'
            : 'No projects match this tag.'}
        </div>
      ) : (
        <div className="adm-projects-list">
          {filtered.map((p) => {
            const globalIdx = projects.findIndex((x) => x.id === p.id)
            const isFirst = globalIdx === 0
            const isLast  = globalIdx === projects.length - 1
            return (
              <div key={p.id} className="adm-project-row">
                {p.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} className="adm-project-thumb" />
                )}
                <div className="adm-project-info">
                  <div className="adm-project-title-row">
                    <span className="adm-project-name">{p.title}</span>
                    {p.it && <em className="adm-project-it">, {p.it}</em>}
                  </div>
                  <div className="adm-project-meta">
                    {p.location}{p.year ? ` · ${p.year}` : ''}
                    {p.imageCount != null ? ` · ${p.imageCount} images` : ''}
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="adm-project-tags">
                      {p.tags.map((tid) => {
                        const tag = PROJECT_TAGS.find((t) => t.id === tid)
                        return tag ? (
                          <span
                            key={tid}
                            className="adm-tag-pill"
                            style={{ '--tag-color': tag.color } as React.CSSProperties}
                          >
                            {tag.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                  <div className="adm-project-folder">{p.folder}</div>
                </div>
                <div className="adm-project-actions">
                  <div className="adm-project-order-btns">
                    <button className="adm-project-order-btn" onClick={() => onMoveUp(p.id)} disabled={isFirst} title="Move up">↑</button>
                    <button className="adm-project-order-btn" onClick={() => onMoveDown(p.id)} disabled={isLast}  title="Move down">↓</button>
                  </div>
                  <button className="adm-project-edit-btn" onClick={() => onEdit(p)} title="Edit project details">✏</button>
                  {p.coverId && (
                    <button className="adm-project-focal-btn" onClick={() => onSetCoverFocal(p)} title="Set cover focal point">⊙</button>
                  )}
                  <button className="adm-project-img-btn" onClick={() => onManageImages(p)} title="Manage visible images">
                    Images {p.hiddenImages?.length ? `· ${p.hiddenImages.length} hidden` : ''}
                  </button>
                  <button className="adm-project-remove" onClick={() => onRemove(p.id)} title="Remove project">×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── FolderBrowserPanel ───────────────────────────────────────────────────────

function FolderBrowserPanel({
  categoryId, onAdd, onCancel,
}: {
  categoryId: string
  onAdd: (project: Omit<AdminProject, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [path, setPath]               = useState('')
  const [folders, setFolders]         = useState<CloudinaryFolder[]>([])
  const [loading, setLoading]         = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<CloudinaryFolder | null>(null)
  const [enteredFolder, setEnteredFolder] = useState<CloudinaryFolder | null>(null)
  const [form, setForm]               = useState({ title: '', it: '', year: '', location: '', desc: '' })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving]           = useState(false)

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])

  const loadFolders = useCallback(async (p: string) => {
    setLoading(true)
    const data = await fetch(`/api/admin/folders?path=${encodeURIComponent(p)}`).then((r) => r.json())
    setFolders(data.folders ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadFolders('') }, [loadFolders])

  const navigateTo = (p: string, folderInfo?: CloudinaryFolder) => {
    setPath(p)
    setSelectedFolder(null)
    setEnteredFolder(folderInfo ?? null)
    loadFolders(p)
  }

  const selectFolder = (f: CloudinaryFolder) => {
    setSelectedFolder(f)
    setForm((prev) => ({ ...prev, title: f.name.replace(/[-_]/g, ' ') }))
  }

  const selectCurrentFolder = () => {
    if (!enteredFolder) return
    selectFolder(enteredFolder)
  }

  const breadcrumbs = path ? ['root', ...path.split('/')].filter(Boolean) : ['root']

  const handleAdd = async () => {
    if (!selectedFolder || !form.title) return
    setSaving(true)
    await onAdd({
      folder:   selectedFolder.path,
      title:    form.title,
      it:       form.it || undefined,
      year:     form.year,
      location: form.location,
      desc:     form.desc || undefined,
      tags:     selectedTags.length > 0 ? selectedTags : undefined,
    })
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-folder-browser">
      <div className="adm-library-head">
        <div className="adm-library-title">Add project from Cloudinary</div>
        <button className="adm-folder-cancel" onClick={onCancel}>← Back</button>
      </div>

      {/* Breadcrumb */}
      <div className="adm-folder-breadcrumb">
        {breadcrumbs.map((seg, i) => (
          <span key={i}>
            {i > 0 && <span className="adm-folder-sep">/</span>}
            <button
              className="adm-folder-crumb-btn"
              onClick={() => {
                if (i === 0) navigateTo('')
                else navigateTo(breadcrumbs.slice(1, i + 1).join('/'))
              }}
            >
              {seg}
            </button>
          </span>
        ))}
      </div>

      {/* Use current folder shortcut */}
      {enteredFolder && !selectedFolder && (
        <button className="adm-folder-use-current" onClick={selectCurrentFolder}>
          Use &ldquo;{enteredFolder.name}&rdquo; as project
        </button>
      )}

      {/* Folder list */}
      <div className="adm-folder-list">
        {loading && <div className="adm-library-loading">Loading folders…</div>}
        {!loading && folders.length === 0 && (
          <div className="adm-library-loading">No subfolders — use the button above to select this folder.</div>
        )}
        {folders.map((f) => (
          <button
            key={f.path}
            className={`adm-folder-item${selectedFolder?.path === f.path ? ' selected' : ''}`}
            onClick={() => selectFolder(f)}
            onDoubleClick={() => navigateTo(f.path, f)}
          >
            <span className="adm-folder-icon">📁</span>
            <span className="adm-folder-name">{f.name}</span>
            {f.imageCount > 0 && <span className="adm-folder-count">{f.imageCount} img</span>}
            <span className="adm-folder-nav" onClick={(e) => { e.stopPropagation(); navigateTo(f.path, f) }}>→</span>
          </button>
        ))}
      </div>

      {/* Project form — shown when folder is selected */}
      {selectedFolder && (
        <div className="adm-folder-form">
          <div className="adm-folder-form-title">
            Adding: <strong>{selectedFolder.path}</strong>
            {selectedFolder.imageCount > 0 && <span className="adm-folder-form-count">({selectedFolder.imageCount} images)</span>}
          </div>

          <div className="adm-copy-fields">
            <div className="adm-copy-field">
              <label className="adm-copy-label">
                Project title <span className="adm-copy-required">*</span>
              </label>
              <input className="adm-copy-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. The Fruit Table, vol. i" />
            </div>
            <div className="adm-copy-field">
              <label className="adm-copy-label">
                Subtitle <span className="adm-copy-hint">optional</span>
              </label>
              <input className="adm-copy-input" value={form.it} onChange={(e) => setForm((f) => ({ ...f, it: e.target.value }))} placeholder="e.g. studies in natural light" />
            </div>
            <div className="adm-copy-row-2">
              <div className="adm-copy-field">
                <label className="adm-copy-label">Year</label>
                <input className="adm-copy-input" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2025" maxLength={4} />
              </div>
              <div className="adm-copy-field">
                <label className="adm-copy-label">Location</label>
                <input className="adm-copy-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City or venue" />
              </div>
            </div>
            <div className="adm-copy-field">
              <label className="adm-copy-label">
                Description <span className="adm-copy-hint">optional</span>
              </label>
              <input className="adm-copy-input" value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} placeholder="One-line summary of the shoot" />
            </div>
            <div className="adm-copy-field">
              <label className="adm-copy-label">
                Tags <span className="adm-copy-hint">optional — for filtering</span>
              </label>
              <div className="adm-tag-picker">
                {PROJECT_TAGS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`adm-tag-pill adm-tag-pick-btn${selectedTags.includes(t.id) ? ' selected' : ''}`}
                    style={{ '--tag-color': t.color } as React.CSSProperties}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="adm-copy-actions">
            <button className="adm-copy-cancel" onClick={() => setSelectedFolder(null)}>Clear</button>
            <button className="adm-copy-save" onClick={handleAdd} disabled={!form.title || saving}>
              {saving ? 'Adding…' : `Add to ${categoryId} →`}
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── PageCopyEditorPanel ──────────────────────────────────────────────────────

function serializeBody(parts: IntroPart[]): string {
  return parts.map((p) => (typeof p === 'string' ? p : p.it)).join('')
}

const CATEGORY_DEFAULTS: Record<string, CategoryCopy> = {
  culinary:  { heroTitle: culinaryData.cat.name,  introLabel: culinaryData.intro.label,  introBody: serializeBody(culinaryData.intro.body),  pullQuoteText: culinaryData.pullQuote.text,  pullQuoteAttr: culinaryData.pullQuote.attr  },
  spaces:    { heroTitle: spacesData.cat.name,    introLabel: spacesData.intro.label,    introBody: serializeBody(spacesData.intro.body),    pullQuoteText: spacesData.pullQuote.text,    pullQuoteAttr: spacesData.pullQuote.attr    },
  portraits: { heroTitle: portraitsData.cat.name, introLabel: portraitsData.intro.label, introBody: serializeBody(portraitsData.intro.body), pullQuoteText: portraitsData.pullQuote.text, pullQuoteAttr: portraitsData.pullQuote.attr },
  objects:   { heroTitle: objectsData.cat.name,   introLabel: objectsData.intro.label,   introBody: serializeBody(objectsData.intro.body),   pullQuoteText: objectsData.pullQuote.text,   pullQuoteAttr: objectsData.pullQuote.attr   },
  motion:    { heroTitle: motionData.cat.name,    introLabel: motionData.intro.label,    introBody: serializeBody(motionData.intro.body),    pullQuoteText: motionData.pullQuote.text,    pullQuoteAttr: motionData.pullQuote.attr    },
}

// Reference frame dimensions at 1440 × 900 desktop viewport
// (content width = 1440 − 2 × 56px padding = 1328px)
const SLOT_FRAME_DIMS: Record<number, string> = {
  0:  '1440 × 810',   // full-bleed, 16:9
  1:  '810 × 1080',   // asym large, 3:4
  2:  '506 × 506',    // asym small, 1:1
  3:  '506 × 506',    // asym small, 1:1
  4:  '435 × 580',    // three-up, 3:4
  5:  '435 × 580',
  6:  '435 × 580',
  7:  '435 × 580',
  8:  '435 × 580',
  9:  '435 × 580',
  10: '1440 × 617',   // full-bleed pano, 21:9
  11: '658 × 658',    // diptych, 1:1
  12: '658 × 658',
  13: '658 × 370',    // duo, 16:9
  14: '658 × 370',
  15: '881 × 1321',   // offset portrait, 2:3
  16: '1440 × 810',   // full-bleed, 16:9
}

function getFrameDims(slotId: string): string {
  if (slotId.endsWith('-hero'))   return '1440 × 900 px'
  if (slotId === 'info-portrait') return '440 × 550 px'
  if (slotId.startsWith('landing-')) return 'full-bleed'
  const m = slotId.match(/-(\d+)$/)
  if (!m) return ''
  const d = SLOT_FRAME_DIMS[parseInt(m[1])]
  return d ? `${d} px` : ''
}

const FONT_VAR: Record<NonNullable<TextStyle['font']>, string> = {
  serif: 'var(--font-serif)',
  mono:  'var(--font-mono)',
  sans:  'var(--font-sans)',
}

function StyleControls({
  value, onChange,
}: {
  value?: TextStyle
  onChange: (s: TextStyle) => void
}) {
  const s = value ?? {}
  const set = (patch: Partial<TextStyle>) => onChange({ ...s, ...patch })

  return (
    <div className="adm-style-row">
      <div className="adm-style-group">
        {(['serif', 'mono', 'sans'] as const).map((f) => (
          <button
            key={f}
            className={`adm-style-btn${s.font === f ? ' active' : ''}`}
            onClick={() => set({ font: s.font === f ? undefined : f })}
            title={f}
          >
            {f === 'serif' ? 'Serif' : f === 'mono' ? 'Mono' : 'Sans'}
          </button>
        ))}
      </div>
      <div className="adm-style-group">
        <button
          className={`adm-style-btn adm-style-i${s.italic ? ' active' : ''}`}
          onClick={() => set({ italic: !s.italic })}
          title="Italic"
        >I</button>
        <button
          className={`adm-style-btn adm-style-b${s.bold ? ' active' : ''}`}
          onClick={() => set({ bold: !s.bold })}
          title="Bold"
        >B</button>
      </div>
      <div className="adm-style-size">
        <input
          type="number"
          className="adm-style-size-input"
          value={s.size ?? ''}
          min={8} max={200}
          placeholder="px"
          onChange={(e) => set({ size: e.target.value ? Number(e.target.value) : undefined })}
        />
        <span className="adm-style-size-unit">px</span>
      </div>
    </div>
  )
}

function PageCopyEditorPanel({
  categoryId, initial, onSave, onClose,
}: {
  categoryId: string
  initial: Record<string, unknown>
  onSave: (copy: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  if (categoryId === 'info')    return <InfoCopyEditorPanel    initial={initial} onSave={onSave} onClose={onClose} />
  if (categoryId === 'contact') return <ContactCopyEditorPanel initial={initial} onSave={onSave} onClose={onClose} />
  return <CategoryCopyEditorPanel categoryId={categoryId} initial={initial as CategoryCopy} onSave={onSave} onClose={onClose} />
}

function CategoryCopyEditorPanel({
  categoryId, initial, onSave, onClose,
}: {
  categoryId: string
  initial: CategoryCopy
  onSave: (copy: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const [copy, setCopy]   = useState<CategoryCopy>(initial)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof CategoryCopy) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setCopy((prev) => ({ ...prev, [k]: e.target.value }))

  const setStyle = (k: keyof CategoryCopy) => (s: TextStyle) =>
    setCopy((prev) => ({ ...prev, [k]: s }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(copy as Record<string, unknown>)
    setSaving(false)
  }

  const label = categoryId.charAt(0).toUpperCase() + categoryId.slice(1)

  return (
    <aside className="adm-library adm-copy-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Page copy · {label}</div>
        <button className="adm-folder-cancel" onClick={onClose}>← Back</button>
      </div>

      <div className="adm-copy-fields">
        <div className="adm-copy-section-label">Hero</div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Hero title
            <span className="adm-copy-hint">Overrides the category name in the hero</span>
          </label>
          <input
            className="adm-copy-input"
            value={copy.heroTitle ?? ''}
            onChange={set('heroTitle')}
            placeholder={label}
          />
          <StyleControls value={copy.heroTitleStyle} onChange={setStyle('heroTitleStyle')} />
        </div>

        <div className="adm-copy-section-label">Intro</div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Intro label
            <span className="adm-copy-hint">Small eyebrow above the intro paragraph</span>
          </label>
          <input
            className="adm-copy-input"
            value={copy.introLabel ?? ''}
            onChange={set('introLabel')}
            placeholder="On the work"
          />
          <StyleControls value={copy.introLabelStyle} onChange={setStyle('introLabelStyle')} />
        </div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Intro body
            <span className="adm-copy-hint">Main paragraph text</span>
          </label>
          <textarea
            className="adm-copy-textarea"
            value={copy.introBody ?? ''}
            onChange={set('introBody')}
            rows={5}
            placeholder="Paragraph text for the category intro…"
          />
          <StyleControls value={copy.introBodyStyle} onChange={setStyle('introBodyStyle')} />
        </div>

        <div className="adm-copy-section-label">Pull quote</div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">Quote text</label>
          <textarea
            className="adm-copy-textarea"
            value={copy.pullQuoteText ?? ''}
            onChange={set('pullQuoteText')}
            rows={3}
            placeholder="A short, memorable quote or statement…"
          />
          <StyleControls value={copy.pullQuoteStyle} onChange={setStyle('pullQuoteStyle')} />
        </div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Attribution
            <span className="adm-copy-hint">Who said it, or a source</span>
          </label>
          <input
            className="adm-copy-input"
            value={copy.pullQuoteAttr ?? ''}
            onChange={set('pullQuoteAttr')}
            placeholder="Studio note · 2025"
          />
          <StyleControls value={copy.pullQuoteAttrStyle} onChange={setStyle('pullQuoteAttrStyle')} />
        </div>

        <div className="adm-copy-section-label">Projects section</div>

        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Section title
            <span className="adm-copy-hint">Overrides &quot;Selected Projects&quot;</span>
          </label>
          <input
            className="adm-copy-input"
            value={copy.projectsSectionTitle ?? ''}
            onChange={set('projectsSectionTitle')}
            placeholder="Selected Projects"
          />
        </div>
      </div>

      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onClose}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save copy →'}
        </button>
      </div>
    </aside>
  )
}

// ─── InfoCopyEditorPanel ──────────────────────────────────────────────────────

function InfoCopyEditorPanel({
  initial, onSave, onClose,
}: {
  initial: Record<string, unknown>
  onSave: (copy: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const c = initial as InfoCopy
  const [heroIntro,           setHeroIntro]           = useState(c.heroIntro           ?? 'Independent photographer working between New York and Bombay. Portraits, interiors, and the quiet objects in between.')
  const [bioPara1,            setBioPara1]            = useState(c.bioPara1            ?? 'Kshetej Sareen is a photographer whose work moves between studio portraits and the small, particular objects of everyday life — vessels, linens, fruit on a table, hands at work. Trained as an architect, his frames lean toward the still, the patient, the carefully lit.')
  const [bioPara2,            setBioPara2]            = useState(c.bioPara2            ?? 'He keeps two studios — one in Brooklyn, one in Bombay — and works on commission for editorial, hospitality, and book projects. Available worldwide and currently booking for 2026.')
  const [heroCap,             setHeroCap]             = useState(c.heroCap             ?? 'Self · Studio · 2026')
  const [practiceItems,       setPracticeItems]       = useState(c.practiceItems       ?? 'Portraits — 24\nCulinary — 38\nSpaces — 19\nObjects — 12\nMotion — 7')
  const [practiceNote,        setPracticeNote]        = useState(c.practiceNote        ?? 'Selected frames live in the category index — Portraits, Culinary, Spaces, Objects, Motion.')
  const [nowItems,            setNowItems]            = useState(c.nowItems            ?? 'Residency — Kindred Studio, Brooklyn — through Aug 2026\nIn progress — The Fruit Table, vol. ii (Kyoto)\nAvailable — Bookings · May–Sept 2026\nPrint sales — Editions of 12 — by request')
  const [clients,             setClients]             = useState(c.clients             ?? 'Apartamento — 2021—\nCereal Magazine — 2022—\nKinfolk — 2023—\nThe New York Times — 2024—\nThe Gentlewoman — 2024\nAēsop — 2023, 2025\nLe Labo — 2024\nHermès — 2025')
  const [press,               setPress]               = useState(c.press               ?? "Pier 24 — group show — 2025\nAperture, vol. 246 — 2024\nFoam Talent — finalist — 2024\nBritish Journal of Photography — 2023\nIt's Nice That · profile — 2023")
  const [touchEmail,          setTouchEmail]          = useState(c.touchEmail          ?? 'info@kshetejsareen.com')
  const [touchEmailNote,      setTouchEmailNote]      = useState(c.touchEmailNote      ?? 'For commissions & prints')
  const [touchAppointment,    setTouchAppointment]    = useState(c.touchAppointment    ?? 'New York · Bombay')
  const [touchAppointmentNote,setTouchAppointmentNote]= useState(c.touchAppointmentNote ?? 'Studio visits welcome')
  const [touchSocial,         setTouchSocial]         = useState(c.touchSocial         ?? '@kshetejsareen')
  const [touchSocialNote,     setTouchSocialNote]     = useState(c.touchSocialNote     ?? 'Instagram')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      heroIntro, bioPara1, bioPara2, heroCap,
      practiceItems, practiceNote,
      nowItems, clients, press,
      touchEmail, touchEmailNote,
      touchAppointment, touchAppointmentNote,
      touchSocial, touchSocialNote,
    })
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-copy-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Page copy · Info</div>
        <button className="adm-folder-cancel" onClick={onClose}>← Back</button>
      </div>
      <div className="adm-copy-fields">

        <div className="adm-copy-section-label">Hero</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Hero intro paragraph</label>
          <textarea className="adm-copy-textarea" rows={3} value={heroIntro} onChange={(e) => setHeroIntro(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Photo caption
            <span className="adm-copy-hint">Below the portrait image</span>
          </label>
          <input className="adm-copy-input" value={heroCap} onChange={(e) => setHeroCap(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Biography</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">First paragraph</label>
          <textarea className="adm-copy-textarea" rows={4} value={bioPara1} onChange={(e) => setBioPara1(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Second paragraph</label>
          <textarea className="adm-copy-textarea" rows={3} value={bioPara2} onChange={(e) => setBioPara2(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Practice</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Practice items
            <span className="adm-copy-hint">Category — frame count, one per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={5} value={practiceItems} onChange={(e) => setPracticeItems(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Practice note</label>
          <input className="adm-copy-input" value={practiceNote} onChange={(e) => setPracticeNote(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Now</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Current items
            <span className="adm-copy-hint">One item per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={5} value={nowItems} onChange={(e) => setNowItems(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Selected clients</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Clients
            <span className="adm-copy-hint">Name — Year, one per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={8} value={clients} onChange={(e) => setClients(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Press &amp; exhibitions</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Press
            <span className="adm-copy-hint">Name — Year, one per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={5} value={press} onChange={(e) => setPress(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Get in touch</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Studio email</label>
          <input className="adm-copy-input" value={touchEmail} onChange={(e) => setTouchEmail(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Email note
            <span className="adm-copy-hint">Small line below the email</span>
          </label>
          <input className="adm-copy-input" value={touchEmailNote} onChange={(e) => setTouchEmailNote(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">By appointment (locations)</label>
          <input className="adm-copy-input" value={touchAppointment} onChange={(e) => setTouchAppointment(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Appointment note</label>
          <input className="adm-copy-input" value={touchAppointmentNote} onChange={(e) => setTouchAppointmentNote(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Social handle
            <span className="adm-copy-hint">Links to instagram.com/handle</span>
          </label>
          <input className="adm-copy-input" value={touchSocial} onChange={(e) => setTouchSocial(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Social note</label>
          <input className="adm-copy-input" value={touchSocialNote} onChange={(e) => setTouchSocialNote(e.target.value)} />
        </div>

      </div>
      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onClose}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save copy →'}
        </button>
      </div>
    </aside>
  )
}

// ─── ContactCopyEditorPanel ───────────────────────────────────────────────────

function ContactCopyEditorPanel({
  initial, onSave, onClose,
}: {
  initial: Record<string, unknown>
  onSave: (copy: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const c = initial as ContactCopy
  const [tickerStatus,    setTickerStatus]    = useState(c.tickerStatus    ?? 'Open for bookings — May through Sept 2026')
  const [tickerLeadTime,  setTickerLeadTime]  = useState(c.tickerLeadTime  ?? 'Lead time · 3–6 weeks')
  const [heroTitle,       setHeroTitle]       = useState(c.heroTitle       ?? 'Say hello')
  const [heroPara1,       setHeroPara1]       = useState(c.heroPara1       ?? "For commissions, prints, and press — the form is the fastest route. Tell me a little about the project and I'll write back within two working days.")
  const [heroPara2,       setHeroPara2]       = useState(c.heroPara2       ?? "Returning collaborators and editors, you have the studio direct line below. Working between New York and Bombay, expect a thoughtful (slightly slow) reply.")
  const [inquiryHeading,  setInquiryHeading]  = useState(c.inquiryHeading  ?? 'Start with the project, not the form.')
  const [inquiryNote,     setInquiryNote]     = useState(c.inquiryNote     ?? "The chips are optional — fill the ones you know. Skip the rest. I'll figure it out from the message.")
  const [privacyText,     setPrivacyText]     = useState(c.privacyText     ?? 'No mailing list. Your details stay between us.')
  const [directTitle,     setDirectTitle]     = useState(c.directTitle     ?? 'Direct channels.')
  const [directDesc,      setDirectDesc]      = useState(c.directDesc      ?? 'For returning collaborators, press inquiries, and walk-up questions — the fastest way is straight to the line.')
  const [directChannels,  setDirectChannels]  = useState(c.directChannels  ?? 'Studio | info@kshetejsareen.com | For commissions & prints | mailto:info@kshetejsareen.com\nWhatsApp | +91 99995 67676 | Fastest response | https://wa.me/919999567676\nElsewhere | @kshetejsareen | Instagram | https://instagram.com/kshetejsareen\nNew York | Brooklyn, NY | By appointment · Mon–Fri |\nBombay | Bandra W, Mumbai | By appointment |\nPress | info@kshetejsareen.com | Media inquiries, image use | mailto:info@kshetejsareen.com')
  const [notesLeft,       setNotesLeft]       = useState(c.notesLeft       ?? 'Lead time — Commissions typically book 3–6 weeks out. Print orders ship within 10 working days.\nTravel — Comfortable working internationally. Travel costs billed at actuals; no day-rate uplift.\nImage use & press — Press kit and high-res files available on request from info@kshetejsareen.com.')
  const [notesRight,      setNotesRight]      = useState(c.notesRight      ?? 'Day rates — Available on request once project scope is clear. Half-day, full-day, and multi-day rates.\nUsage & licensing — All commissions include a 12-month editorial usage by default. Extended usage and exclusivity quoted separately.\nPrints — Editions of 12, printed in studio on Hahnemühle Photo Rag. Signed, numbered, and stamped on verso.')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      tickerStatus, tickerLeadTime,
      heroTitle, heroPara1, heroPara2,
      inquiryHeading, inquiryNote, privacyText,
      directTitle, directDesc, directChannels,
      notesLeft, notesRight,
    })
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-copy-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Page copy · Contact</div>
        <button className="adm-folder-cancel" onClick={onClose}>← Back</button>
      </div>
      <div className="adm-copy-fields">

        <div className="adm-copy-section-label">Availability ticker</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Status text
            <span className="adm-copy-hint">Left side of the ticker bar</span>
          </label>
          <input className="adm-copy-input" value={tickerStatus} onChange={(e) => setTickerStatus(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Lead time text
            <span className="adm-copy-hint">Right side of the ticker bar</span>
          </label>
          <input className="adm-copy-input" value={tickerLeadTime} onChange={(e) => setTickerLeadTime(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Hero</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Hero title</label>
          <input className="adm-copy-input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Say hello" />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">First paragraph</label>
          <textarea className="adm-copy-textarea" rows={4} value={heroPara1} onChange={(e) => setHeroPara1(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Second paragraph</label>
          <textarea className="adm-copy-textarea" rows={4} value={heroPara2} onChange={(e) => setHeroPara2(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Project inquiry</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Section heading</label>
          <input className="adm-copy-input" value={inquiryHeading} onChange={(e) => setInquiryHeading(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Section note</label>
          <textarea className="adm-copy-textarea" rows={2} value={inquiryNote} onChange={(e) => setInquiryNote(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Privacy text
            <span className="adm-copy-hint">Below the submit button</span>
          </label>
          <input className="adm-copy-input" value={privacyText} onChange={(e) => setPrivacyText(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Direct channels</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Section title</label>
          <input className="adm-copy-input" value={directTitle} onChange={(e) => setDirectTitle(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Section description</label>
          <textarea className="adm-copy-textarea" rows={2} value={directDesc} onChange={(e) => setDirectDesc(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Channel entries
            <span className="adm-copy-hint">Label | Value | Note | URL, one per line. URL is optional.</span>
          </label>
          <textarea className="adm-copy-textarea" rows={7} value={directChannels} onChange={(e) => setDirectChannels(e.target.value)} />
        </div>

        <div className="adm-copy-section-label">Working notes</div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Left column
            <span className="adm-copy-hint">Label — Value, one per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={5} value={notesLeft} onChange={(e) => setNotesLeft(e.target.value)} />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Right column
            <span className="adm-copy-hint">Label — Value, one per line</span>
          </label>
          <textarea className="adm-copy-textarea" rows={5} value={notesRight} onChange={(e) => setNotesRight(e.target.value)} />
        </div>

      </div>
      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onClose}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save copy →'}
        </button>
      </div>
    </aside>
  )
}

// ─── ProjectImagesPanel ───────────────────────────────────────────────────────

function ProjectImagesPanel({
  project, categoryId, onSave, onCancel,
}: {
  project: AdminProject
  categoryId: string
  onSave: (hiddenImages: string[], coverId?: string) => Promise<void>
  onCancel: () => void
}) {
  const [images, setImages]   = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [hidden, setHidden]   = useState<Set<string>>(new Set(project.hiddenImages ?? []))
  const [coverId, setCoverId] = useState<string | undefined>(project.coverId)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/images?folder=${encodeURIComponent(project.folder)}&all=true`)
      .then((r) => r.json())
      .then((d) => { setImages(d.images ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [project.folder])

  const toggle = (publicId: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(publicId)) next.delete(publicId)
      else next.add(publicId)
      return next
    })
  }

  const visibleCount = images.length - hidden.size
  const hiddenCount  = hidden.size

  const handleSave = async () => {
    setSaving(true)
    await onSave([...hidden], coverId)
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-proj-images-panel">
      <div className="adm-library-head">
        <div className="adm-library-title">
          {project.title}
          <span className="adm-proj-images-folder">{project.folder}</span>
        </div>
        <button className="adm-folder-cancel" onClick={onCancel}>← Back</button>
      </div>

      <div className="adm-proj-images-summary">
        <span><strong>{visibleCount}</strong> visible</span>
        {hiddenCount > 0 && <span className="adm-proj-images-hidden-count"><strong>{hiddenCount}</strong> hidden</span>}
        {loading && <span>Loading…</span>}
      </div>
      <div className="adm-proj-images-hint">
        Click to toggle visibility · Hover and click ★ to set as project cover
      </div>

      <div className="adm-proj-images-grid">
        {images.map((img) => {
          const isHidden  = hidden.has(img.public_id)
          const isCover   = img.public_id === coverId
          return (
            <div
              key={img.public_id}
              className={`adm-proj-img-item${isHidden ? ' hidden' : ''}${isCover ? ' is-cover' : ''}`}
            >
              <button
                className="adm-proj-img-toggle"
                onClick={() => toggle(img.public_id)}
                title={isHidden ? 'Click to show' : 'Click to hide'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(img.secure_url)} alt="" className="adm-proj-img-thumb" />
              </button>
              <div className="adm-proj-img-footer">
                <span className="adm-proj-img-badge">
                  {isCover ? '★ Cover' : isHidden ? 'Hidden' : 'Visible'}
                </span>
                {!isHidden && (
                  <button
                    className={`adm-proj-set-cover-btn${isCover ? ' active' : ''}`}
                    onClick={() => setCoverId(isCover ? undefined : img.public_id)}
                    title={isCover ? 'Remove cover' : 'Set as cover'}
                  >
                    {isCover ? '★' : '☆'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onCancel}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save →'}
        </button>
      </div>
    </aside>
  )
}

// ─── ProjectEditPanel ─────────────────────────────────────────────────────────

function ProjectEditPanel({
  project, onSave, onCancel,
}: {
  project: AdminProject
  onSave: (updates: Partial<AdminProject>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title:    project.title    ?? '',
    it:       project.it       ?? '',
    year:     project.year     ?? '',
    location: project.location ?? '',
    desc:     project.desc     ?? '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(project.tags ?? [])
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])

  const handleSave = async () => {
    if (!form.title) return
    setSaving(true)
    await onSave({
      title:    form.title,
      it:       form.it       || undefined,
      year:     form.year,
      location: form.location,
      desc:     form.desc     || undefined,
      tags:     selectedTags.length > 0 ? selectedTags : undefined,
    })
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-copy-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Edit project</div>
        <button className="adm-folder-cancel" onClick={onCancel}>← Back</button>
      </div>

      <div className="adm-copy-fields">
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Project title <span className="adm-copy-required">*</span>
          </label>
          <input className="adm-copy-input" value={form.title} onChange={set('title')} placeholder="e.g. The Fruit Table, vol. i" />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Subtitle <span className="adm-copy-hint">optional</span>
          </label>
          <input className="adm-copy-input" value={form.it} onChange={set('it')} placeholder="e.g. studies in natural light" />
        </div>
        <div className="adm-copy-row-2">
          <div className="adm-copy-field">
            <label className="adm-copy-label">Year</label>
            <input className="adm-copy-input" value={form.year} onChange={set('year')} placeholder="2025" maxLength={4} />
          </div>
          <div className="adm-copy-field">
            <label className="adm-copy-label">Location</label>
            <input className="adm-copy-input" value={form.location} onChange={set('location')} placeholder="City or venue" />
          </div>
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Description <span className="adm-copy-hint">optional</span>
          </label>
          <input className="adm-copy-input" value={form.desc} onChange={set('desc')} placeholder="One-line summary of the shoot" />
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">
            Tags <span className="adm-copy-hint">optional</span>
          </label>
          <div className="adm-tag-picker">
            {PROJECT_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`adm-tag-pill adm-tag-pick-btn${selectedTags.includes(t.id) ? ' selected' : ''}`}
                style={{ '--tag-color': t.color } as React.CSSProperties}
                onClick={() => toggleTag(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-copy-field">
          <label className="adm-copy-label">Folder</label>
          <div className="adm-copy-input" style={{ color: '#555', cursor: 'default' }}>{project.folder}</div>
        </div>
      </div>

      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onCancel}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={!form.title || saving}>
          {saving ? 'Saving…' : 'Save changes →'}
        </button>
      </div>
    </aside>
  )
}

// ─── LibraryPanel ─────────────────────────────────────────────────────────────

function LibraryPanel({
  images, nextCursor, loadingImages, error, searchQ, selectedSlot, assigning,
  currentFolder, onSearch, onFolderChange, onSelectImage, onAssignUrl, onLoadMore,
}: {
  images: CloudinaryImage[]
  nextCursor: string | null
  loadingImages: boolean
  error: string
  searchQ: string
  selectedSlot: Slot | null
  assigning: boolean
  currentFolder: string
  onSearch: (q: string) => void
  onFolderChange: (folder: string) => void
  onSelectImage: (img: CloudinaryImage) => void
  onAssignUrl: (url: string) => Promise<void>
  onLoadMore: () => void
}) {
  const [urlInput, setUrlInput] = useState('')
  const [folders, setFolders] = useState<{ name: string; path: string; imageCount: number }[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)

  useEffect(() => {
    if (searchQ) { setFolders([]); return }
    setLoadingFolders(true)
    fetch(`/api/admin/folders?path=${encodeURIComponent(currentFolder)}`)
      .then((r) => r.json())
      .then((d) => setFolders(d.folders ?? []))
      .catch(() => setFolders([]))
      .finally(() => setLoadingFolders(false))
  }, [currentFolder, searchQ])

  const segments = currentFolder ? currentFolder.split('/') : []

  return (
    <aside className="adm-library">
      <div className="adm-library-head">
        <div className="adm-library-title">Cloudinary Library</div>
        <input
          className="adm-library-search"
          type="search"
          placeholder="Search all…"
          value={searchQ}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Breadcrumb */}
      <div className="adm-lib-breadcrumb">
        <button
          className={`adm-lib-crumb${!currentFolder ? ' active' : ''}`}
          onClick={() => onFolderChange('')}
        >All</button>
        {segments.map((seg, i) => {
          const path = segments.slice(0, i + 1).join('/')
          return (
            <span key={path}>
              <span className="adm-lib-crumb-sep">/</span>
              <button
                className={`adm-lib-crumb${i === segments.length - 1 ? ' active' : ''}`}
                onClick={() => onFolderChange(path)}
              >{seg}</button>
            </span>
          )
        })}
      </div>

      {/* Folder tiles */}
      {!searchQ && (
        <div className="adm-lib-folder-row">
          {loadingFolders && <span className="adm-lib-folder-loading">Loading…</span>}
          {folders.map((f) => (
            <button key={f.path} className="adm-lib-folder-btn" onClick={() => onFolderChange(f.path)}>
              <span className="adm-lib-folder-icon">▶</span>
              <span className="adm-lib-folder-name">{f.name}</span>
              {f.imageCount > 0 && <span className="adm-lib-folder-count">{f.imageCount}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="adm-url-assign">
        <input
          className="adm-url-input"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={selectedSlot ? 'Paste Cloudinary URL or public_id…' : 'Select a slot, then paste a URL…'}
          disabled={!selectedSlot}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && urlInput.trim() && selectedSlot) {
              onAssignUrl(urlInput.trim()).then(() => setUrlInput(''))
            }
          }}
        />
        <button
          className="adm-url-assign-btn"
          disabled={!urlInput.trim() || !selectedSlot || assigning}
          onClick={() => onAssignUrl(urlInput.trim()).then(() => setUrlInput(''))}
        >
          Assign →
        </button>
      </div>

      {selectedSlot && (
        <div className="adm-library-hint">
          Click an image below or paste a URL — assigning to <strong>{selectedSlot.label}</strong>
        </div>
      )}

      <div className="adm-library-grid">
        {images.map((img) => (
          <button
            key={img.public_id}
            className={`adm-lib-img-btn${selectedSlot ? ' selectable' : ''}`}
            onClick={() => selectedSlot && onSelectImage(img)}
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
              <div className="adm-lib-assigned-badge" title={img.context.custom.portfolio_slot}>●</div>
            )}
          </button>
        ))}
        {error && (
          <div className="adm-library-error">{error}</div>
        )}
        {!loadingImages && !error && images.length === 0 && !loadingFolders && (
          <div className="adm-library-loading">No images here.</div>
        )}
      </div>

      {loadingImages && <div className="adm-library-loading">Loading…</div>}
      {nextCursor && !loadingImages && (
        <button className="adm-load-more" onClick={onLoadMore}>Load more</button>
      )}
    </aside>
  )
}
