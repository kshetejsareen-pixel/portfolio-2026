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
import type { FontConfig } from '@/lib/fontConfig'
import { GFONTS, applyFontConfig } from '@/components/FontLoader'
import type { MotionVideo } from '@/lib/motionVideos'
import { extractYouTubeId } from '@/lib/youtubeUtils'

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
  | { mode: 'folder-browser'; categoryId: string; initialPath?: string }
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
  const [libraryOpen, setLibraryOpen]   = useState(false)
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
    fetch('/api/admin/fonts').then((r) => r.json()).then((d) => { if (d.config) setFontConfig(d.config) })
    fetch('/api/admin/motion-videos').then((r) => r.json()).then((d) => { if (d.videos) setMotionVideos(d.videos) })
  }, [fetchImages, fetchAssignments, fetchConfig, fetchProjects, fetchCopyCfg])

  // ── Font config state ──────────────────────────────────────────────────────
  const [fontConfig, setFontConfig] = useState<FontConfig>({})

  // ── Motion videos state ────────────────────────────────────────────────────
  const [motionVideos, setMotionVideos] = useState<MotionVideo[]>([])

  // ── Inline copy draft state ────────────────────────────────────────────────
  const [draftCopy, setDraftCopy]   = useState<Record<string, unknown>>({})
  const [copyDirty, setCopyDirty]   = useState(false)
  const [copySaving, setCopySaving] = useState(false)

  useEffect(() => {
    const defaults: Record<string, unknown> =
      CAT_IDS.includes(activeCatId) ? (CATEGORY_DEFAULTS[activeCatId] ?? {}) as Record<string, unknown>
      : activeCatId === 'info'      ? INFO_COPY_DEFAULTS
      : activeCatId === 'contact'   ? CONTACT_COPY_DEFAULTS
      : {}
    setDraftCopy({ ...defaults, ...(copyCfg[activeCatId] ?? {}) })
    setCopyDirty(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, copyCfg])

  const setDraftField = (key: string, value: unknown) => {
    setDraftCopy((prev) => ({ ...prev, [key]: value }))
    setCopyDirty(true)
  }

  const saveCopy = async () => {
    setCopySaving(true)
    await fetch('/api/admin/copy', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: activeCatId, updates: draftCopy }),
    })
    setCopyCfg((prev) => ({ ...prev, [activeCatId]: draftCopy }))
    setCopyDirty(false)
    setCopySaving(false)
    showToast('Copy saved')
  }

  const discardCopy = () => {
    const defaults: Record<string, unknown> =
      CAT_IDS.includes(activeCatId) ? (CATEGORY_DEFAULTS[activeCatId] ?? {}) as Record<string, unknown>
      : activeCatId === 'info'      ? INFO_COPY_DEFAULTS
      : activeCatId === 'contact'   ? CONTACT_COPY_DEFAULTS
      : {}
    setDraftCopy({ ...defaults, ...(copyCfg[activeCatId] ?? {}) })
    setCopyDirty(false)
  }

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
    <div className={`adm-root${rightPanel.mode !== 'library' ? ' adm-root--panel-open' : ''}`}>

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
            className={`adm-lib-btn${libraryOpen ? ' adm-lib-btn--active' : ''}`}
            onClick={() => setLibraryOpen((v) => !v)}
          >
            {libraryOpen ? 'Close library' : 'Library'}
          </button>
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
          {selectedSlot && (
            <div className="adm-selecting-badge">
              Selecting for: <strong>{selectedSlot.label}</strong>
              <button className="adm-cancel-select" onClick={() => setSelectedSlot(null)}>Cancel ×</button>
            </div>
          )}
        </div>

        {copyDirty && (
          <div className="adm-copy-save-bar">
            <span className="adm-copy-save-bar-msg">Unsaved copy changes</span>
            <button className="adm-copy-save-bar-discard" onClick={discardCopy}>Discard</button>
            <button className="adm-copy-save-bar-btn" onClick={saveCopy} disabled={copySaving}>
              {copySaving ? 'Saving…' : 'Save →'}
            </button>
          </div>
        )}

        {/* Slot grid */}
        {activePage === 'Landing' ? (
          <div className="adm-slots-scroll">
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
          // ── Helpers for inline copy fields ─────────────────────────────────
          const d  = (k: string) => (draftCopy[k] as string) ?? ''
          const ds = (k: string) => (draftCopy[k] as TextStyle | undefined)
          const sf = (k: string) => (v: string)     => setDraftField(k, v)
          const ss = (k: string) => (v: TextStyle)  => setDraftField(k, v)

          // ── Fonts page ──────────────────────────────────────────────────────
          if (activeCatId === 'fonts') {
            return (
              <div className="adm-slots-scroll">
                <FontsPanel
                  config={fontConfig}
                  onSave={async (cfg) => {
                    await fetch('/api/admin/fonts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(cfg),
                    })
                    setFontConfig(cfg)
                    applyFontConfig(cfg)
                    showToast('Fonts saved')
                  }}
                />
              </div>
            )
          }

          // ── Info page ───────────────────────────────────────────────────────
          if (activeCatId === 'info') {
            const portraitSlot = pageSlots.find((s) => s.id === 'info-portrait')
            return (
              <div className="adm-slots-scroll adm-slots-scroll--cat">
                <InlineCopyDivider title="Hero" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Hero eyebrow" hint="Small label above the name" value={d('heroEyebrow')} onChange={sf('heroEyebrow')} placeholder="Info · A working biography" />
                  <InlineCopyField label="Hero intro paragraph" value={d('heroIntro')} onChange={sf('heroIntro')} multiline rows={3} />
                </div>
                {portraitSlot && (
                  <div className="adm-cat-section">
                    <div className="adm-cat-section-head">
                      <span className="adm-cat-section-title">Portrait photo</span>
                      <span className="adm-cat-section-desc">4:5 · appears left of name in hero</span>
                    </div>
                    <div className="adm-slots-grid">{renderCard(portraitSlot)}</div>
                  </div>
                )}
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Photo caption" hint="Appears below portrait" value={d('heroCap')} onChange={sf('heroCap')} placeholder="Self · Studio · 2026" />
                </div>

                <InlineCopyDivider title="Biography" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Section heading" value={d('bioHeading')} onChange={sf('bioHeading')} placeholder="Biography" />
                  <InlineCopyField label="First paragraph" value={d('bioPara1')} onChange={sf('bioPara1')} multiline rows={4} />
                  <InlineCopyField label="Second paragraph" value={d('bioPara2')} onChange={sf('bioPara2')} multiline rows={3} />
                </div>

                <InlineCopyDivider title="Get in touch" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Section heading" value={d('touchHeading')} onChange={sf('touchHeading')} placeholder="Get in touch" />
                  <InlineCopyField label="Studio email" value={d('touchEmail')} onChange={sf('touchEmail')} />
                  <InlineCopyField label="Email note" value={d('touchEmailNote')} onChange={sf('touchEmailNote')} />
                  <InlineCopyField label="By appointment (locations)" value={d('touchAppointment')} onChange={sf('touchAppointment')} />
                  <InlineCopyField label="Appointment note" value={d('touchAppointmentNote')} onChange={sf('touchAppointmentNote')} />
                  <InlineCopyField label="Social handle" hint="Links to instagram.com/handle" value={d('touchSocial')} onChange={sf('touchSocial')} />
                  <InlineCopyField label="Social note" value={d('touchSocialNote')} onChange={sf('touchSocialNote')} />
                </div>
              </div>
            )
          }

          // ── Contact page ────────────────────────────────────────────────────
          if (activeCatId === 'contact') {
            return (
              <div className="adm-slots-scroll adm-slots-scroll--cat">
                <InlineCopyDivider title="Availability ticker" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Status text" hint="Left side of ticker bar" value={d('tickerStatus')} onChange={sf('tickerStatus')} />
                  <InlineCopyField label="Lead time text" hint="Right side of ticker bar" value={d('tickerLeadTime')} onChange={sf('tickerLeadTime')} />
                </div>

                <InlineCopyDivider title="Hero" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Hero title" value={d('heroTitle')} onChange={sf('heroTitle')} placeholder="Say hello" />
                  <InlineCopyField label="First paragraph" value={d('heroPara1')} onChange={sf('heroPara1')} multiline rows={3} />
                  <InlineCopyField label="Second paragraph" value={d('heroPara2')} onChange={sf('heroPara2')} multiline rows={3} />
                </div>

                <InlineCopyDivider title="Project inquiry form" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Section eyebrow" hint="Visible heading above the form" value={d('inquiryEyebrow')} onChange={sf('inquiryEyebrow')} placeholder="01 · Project inquiry" />
                  <InlineCopyField label="Form heading" value={d('inquiryHeading')} onChange={sf('inquiryHeading')} />
                  <InlineCopyField label="Form note" value={d('inquiryNote')} onChange={sf('inquiryNote')} multiline rows={2} />
                  <InlineCopyField label="Privacy text" hint="Below the submit button" value={d('privacyText')} onChange={sf('privacyText')} />
                </div>

                <InlineCopyDivider title="Direct channels" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Section title" value={d('directTitle')} onChange={sf('directTitle')} />
                  <InlineCopyField label="Section description" value={d('directDesc')} onChange={sf('directDesc')} multiline rows={2} />
                  <InlineCopyField label="Channel entries" hint="Label | Value | Note | URL, one per line" value={d('directChannels')} onChange={sf('directChannels')} multiline rows={7} />
                </div>

                <InlineCopyDivider title="Working notes" />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Section eyebrow" hint="Visible heading above the table" value={d('notesEyebrow')} onChange={sf('notesEyebrow')} placeholder="02 · Working notes" />
                  <InlineCopyField label="Left column" hint="Label — Value, one per line" value={d('notesLeft')} onChange={sf('notesLeft')} multiline rows={5} />
                  <InlineCopyField label="Right column" hint="Label — Value, one per line" value={d('notesRight')} onChange={sf('notesRight')} multiline rows={5} />
                </div>
              </div>
            )
          }

          if (pageSlots.length === 0) {
            return (
              <div className="adm-slots-scroll">
                <div className="adm-cat-section">
                  <div className="adm-cat-section-head">
                    <span className="adm-cat-section-title">No image slots</span>
                    <span className="adm-cat-section-desc">No image slots defined for this page</span>
                  </div>
                </div>
              </div>
            )
          }

          // ── Motion page (videos) ────────────────────────────────────────────
          if (activeCatId === 'motion') {
            const heroSlot = pageSlots.find((s) => s.id === 'motion-hero')
            return (
              <div className="adm-slots-scroll adm-slots-scroll--cat">
                {heroSlot && (
                  <div className="adm-cat-section">
                    <div className="adm-cat-section-head">
                      <span className="adm-cat-section-title">Hero Banner</span>
                      <span className="adm-cat-section-desc">Full-bleed background behind the Motion title</span>
                    </div>
                    <div className="adm-slots-grid">{renderCard(heroSlot)}</div>
                  </div>
                )}
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Category title" hint="Large text over the hero banner" value={d('heroTitle')} onChange={sf('heroTitle')} placeholder="Motion" withStyle styleValue={ds('heroTitleStyle')} onStyleChange={ss('heroTitleStyle')} />
                  <InlineCopyField label="Hero oneliner" hint="Short descriptor shown below the title on the hero" value={d('heroOneliner')} onChange={sf('heroOneliner')} placeholder="e.g. Film & moving image, 2021–2026" multiline rows={2} />
                </div>
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Intro label" hint="Small eyebrow above the intro paragraph" value={d('introLabel')} onChange={sf('introLabel')} placeholder="On the work" withStyle styleValue={ds('introLabelStyle')} onStyleChange={ss('introLabelStyle')} />
                  <InlineCopyField label="Intro body" value={d('introBody')} onChange={sf('introBody')} multiline rows={4} placeholder="Paragraph text for the motion intro…" withStyle styleValue={ds('introBodyStyle')} onStyleChange={ss('introBodyStyle')} />
                </div>
                <MotionVideosPanel
                  videos={motionVideos}
                  onChange={async (updated) => {
                    setMotionVideos(updated)
                    await fetch('/api/admin/motion-videos', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ videos: updated }),
                    })
                    showToast('Videos saved')
                  }}
                />
                <div className="adm-inline-copy-group">
                  <InlineCopyField label="Projects section heading" hint="Overrides 'Selected Projects'" value={d('projectsSectionTitle')} onChange={sf('projectsSectionTitle')} placeholder="Selected Projects" />
                </div>
                <ProjectsSection
                  categoryId="motion"
                  projects={projects['motion'] ?? []}
                  onAdd={() => setRightPanel({ mode: 'folder-browser', categoryId: 'motion' })}
                  onAddFromPath={(folderPath) => setRightPanel({ mode: 'folder-browser', categoryId: 'motion', initialPath: folderPath })}
                  onRemove={async (projectId) => {
                    await fetch('/api/admin/projects', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ categoryId: 'motion', projectId }),
                    })
                    await fetchProjects()
                    showToast('Project removed')
                  }}
                  onManageImages={(project) => setRightPanel({ mode: 'project-images', categoryId: 'motion', project })}
                  onSetCoverFocal={(project) => setRightPanel({ mode: 'project-cover-focal', categoryId: 'motion', project })}
                  onMoveUp={(projectId) => moveProject('motion', projectId, 'up')}
                  onMoveDown={(projectId) => moveProject('motion', projectId, 'down')}
                  onEdit={(project) => setRightPanel({ mode: 'project-edit', categoryId: 'motion', project })}
                />
              </div>
            )
          }

          // ── Category page ───────────────────────────────────────────────────
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
              <div className="adm-inline-copy-group">
                <InlineCopyField label="Category title" hint="Large text over the hero banner" value={d('heroTitle')} onChange={sf('heroTitle')} placeholder={activePage} withStyle styleValue={ds('heroTitleStyle')} onStyleChange={ss('heroTitleStyle')} />
                <InlineCopyField label="Hero oneliner" hint="Short descriptor shown below the title on the hero" value={d('heroOneliner')} onChange={sf('heroOneliner')} placeholder="e.g. Architectural & hospitality photography, 2019–2026" multiline rows={2} />
              </div>
              <div className="adm-inline-copy-group">
                <InlineCopyField label="Intro label" hint="Small eyebrow above the intro paragraph" value={d('introLabel')} onChange={sf('introLabel')} placeholder="On the work" withStyle styleValue={ds('introLabelStyle')} onStyleChange={ss('introLabelStyle')} />
                <InlineCopyField label="Intro body" value={d('introBody')} onChange={sf('introBody')} multiline rows={4} placeholder="Paragraph text for the category intro…" withStyle styleValue={ds('introBodyStyle')} onStyleChange={ss('introBodyStyle')} />
              </div>
              <div className="adm-cat-section">
                <div className="adm-cat-section-head">
                  <span className="adm-cat-section-title">Gallery Frames</span>
                  <span className="adm-cat-section-desc">{gallerySlots.filter((s) => assignments[s.id]).length} / {gallerySlots.length} assigned</span>
                </div>
                <div className="adm-slots-grid">
                  {gallerySlots.map((slot) => renderCard(slot))}
                </div>
              </div>
              <div className="adm-inline-copy-group">
                <InlineCopyField label="Pull quote text" hint="Appears mid-gallery after slot 10" value={d('pullQuoteText')} onChange={sf('pullQuoteText')} multiline rows={3} placeholder="A short, memorable quote or statement…" withStyle styleValue={ds('pullQuoteStyle')} onStyleChange={ss('pullQuoteStyle')} />
                <InlineCopyField label="Pull quote attribution" value={d('pullQuoteAttr')} onChange={sf('pullQuoteAttr')} placeholder="Studio note · 2025" withStyle styleValue={ds('pullQuoteAttrStyle')} onStyleChange={ss('pullQuoteAttrStyle')} />
              </div>
              <div className="adm-inline-copy-group">
                <InlineCopyField label="Projects section heading" hint="Overrides 'Selected Projects'" value={d('projectsSectionTitle')} onChange={sf('projectsSectionTitle')} placeholder="Selected Projects" />
              </div>
              {CAT_IDS.includes(activeCatId) && (
                <ProjectsSection
                  categoryId={activeCatId}
                  projects={projects[activeCatId] ?? []}
                  onAdd={() => setRightPanel({ mode: 'folder-browser', categoryId: activeCatId })}
                  onAddFromPath={(folderPath) => setRightPanel({ mode: 'folder-browser', categoryId: activeCatId, initialPath: folderPath })}
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
          key={rightPanel.initialPath ?? ''}
          categoryId={rightPanel.categoryId}
          initialPath={rightPanel.initialPath}
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
      ) : null}

      {/* ── Cloudinary library — floating overlay ───────────────────────── */}
      {libraryOpen && (
        <>
          <div className="adm-lib-backdrop" onClick={() => setLibraryOpen(false)} />
          <div className="adm-lib-overlay">
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
              onClose={() => setLibraryOpen(false)}
            />
          </div>
        </>
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

function extractCloudinaryPath(input: string): string {
  const trimmed = input.trim()
  // Handle full Cloudinary console URLs like:
  // https://console.cloudinary.com/console/dsouvrzlr/media_library/folders/portraits/2024
  const match = trimmed.match(/media_library\/folders\/(.+)/)
  if (match) return match[1].replace(/\/$/, '')
  // Handle plain paths
  return trimmed.replace(/^\/|\/$/g, '')
}

// ─── Inline copy primitives ───────────────────────────────────────────────────

function InlineCopyDivider({ title }: { title: string }) {
  return (
    <div className="adm-inline-divider">
      <span className="adm-inline-divider-label">{title}</span>
    </div>
  )
}

function InlineCopyField({
  label, hint, value, onChange, multiline, rows, placeholder,
  withStyle, styleValue, onStyleChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
  withStyle?: boolean
  styleValue?: TextStyle
  onStyleChange?: (s: TextStyle) => void
}) {
  return (
    <div className="adm-inline-field">
      <label className="adm-inline-label">
        {label}
        {hint && <span className="adm-inline-hint">{hint}</span>}
      </label>
      {multiline ? (
        <textarea
          className="adm-inline-textarea"
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="adm-inline-input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {withStyle && onStyleChange && (
        <StyleControls value={styleValue} onChange={onStyleChange} />
      )}
    </div>
  )
}

function ProjectsSection({
  categoryId, projects, onAdd, onAddFromPath, onRemove, onManageImages, onSetCoverFocal, onMoveUp, onMoveDown, onEdit,
}: {
  categoryId: string
  projects: AdminProject[]
  onAdd: () => void
  onAddFromPath: (path: string) => void
  onRemove: (id: string) => void
  onManageImages: (project: AdminProject) => void
  onSetCoverFocal: (project: AdminProject) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onEdit: (project: AdminProject) => void
}) {
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [pathInput, setPathInput] = useState('')

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
          + Browse folders
        </button>
      </div>
      <div className="adm-projects-path-row">
        <input
          className="adm-projects-path-input"
          type="text"
          placeholder="Paste Cloudinary folder path or URL to add project…"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const p = extractCloudinaryPath(pathInput)
              if (p) { onAddFromPath(p); setPathInput('') }
            }
          }}
        />
        <button
          className="adm-projects-path-go"
          disabled={!pathInput.trim()}
          onClick={() => {
            const p = extractCloudinaryPath(pathInput)
            if (p) { onAddFromPath(p); setPathInput('') }
          }}
        >
          Go →
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
  categoryId, onAdd, onCancel, initialPath,
}: {
  categoryId: string
  onAdd: (project: Omit<AdminProject, 'id'>) => Promise<void>
  onCancel: () => void
  initialPath?: string
}) {
  const [path, setPath]               = useState(initialPath ?? '')
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

  useEffect(() => { loadFolders(initialPath ?? '') }, [loadFolders, initialPath])

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

const INFO_COPY_DEFAULTS: Record<string, unknown> = {
  heroEyebrow:          'Info · A working biography',
  heroIntro:            'Independent photographer working between New York and Bombay. Portraits, interiors, and the quiet objects in between.',
  bioPara1:             'Kshetej Sareen is a photographer whose work moves between studio portraits and the small, particular objects of everyday life — vessels, linens, fruit on a table, hands at work. Trained as an architect, his frames lean toward the still, the patient, the carefully lit.',
  bioPara2:             'He keeps two studios — one in Brooklyn, one in Bombay — and works on commission for editorial, hospitality, and book projects. Available worldwide and currently booking for 2026.',
  heroCap:              'Self · Studio · 2026',
  bioHeading:           'Biography',
  practiceHeading:      'Practice, categories of work',
  practiceItems:        'Portraits — 24\nCulinary — 38\nSpaces — 19\nObjects — 12\nMotion — 7',
  practiceNote:         'Selected frames live in the category index — Portraits, Culinary, Spaces, Objects, Motion.',
  nowHeading:           'Now, current',
  nowItems:             'Residency — Kindred Studio, Brooklyn — through Aug 2026\nIn progress — The Fruit Table, vol. ii (Kyoto)\nAvailable — Bookings · May–Sept 2026\nPrint sales — Editions of 12 — by request',
  clientsHeading:       'Selected clients, recent',
  clients:              'Apartamento — 2021—\nCereal Magazine — 2022—\nKinfolk — 2023—\nThe New York Times — 2024—\nThe Gentlewoman — 2024\nAēsop — 2023, 2025\nLe Labo — 2024\nHermès — 2025',
  pressHeading:         'Press & exhibitions, selected',
  press:                "Pier 24 — group show — 2025\nAperture, vol. 246 — 2024\nFoam Talent — finalist — 2024\nBritish Journal of Photography — 2023\nIt's Nice That · profile — 2023",
  touchHeading:         'Get in touch',
  touchEmail:           'info@kshetejsareen.com',
  touchEmailNote:       'For commissions & prints',
  touchAppointment:     'New York · Bombay',
  touchAppointmentNote: 'Studio visits welcome',
  touchSocial:          '@kshetejsareen',
  touchSocialNote:      'Instagram',
}

const CONTACT_COPY_DEFAULTS: Record<string, unknown> = {
  tickerStatus:    'Open for bookings — May through Sept 2026',
  tickerLeadTime:  'Lead time · 3–6 weeks',
  heroTitle:       'Say hello',
  heroPara1:       "For commissions, prints, and press — the form is the fastest route. Tell me a little about the project and I'll write back within two working days.",
  heroPara2:       "Returning collaborators and editors, you have the studio direct line below. Working between New York and Bombay, expect a thoughtful (slightly slow) reply.",
  inquiryEyebrow:  '01 · Project inquiry',
  inquiryHeading:  'Start with the project, not the form.',
  inquiryNote:     "The chips are optional — fill the ones you know. Skip the rest. I'll figure it out from the message.",
  privacyText:     'No mailing list. Your details stay between us.',
  directTitle:     'Direct channels.',
  directDesc:      'For returning collaborators, press inquiries, and walk-up questions — the fastest way is straight to the line.',
  directChannels:  'Studio | info@kshetejsareen.com | For commissions & prints | mailto:info@kshetejsareen.com\nWhatsApp | +91 99995 67676 | Fastest response | https://wa.me/919999567676\nElsewhere | @kshetejsareen | Instagram | https://instagram.com/kshetejsareen\nNew York | Brooklyn, NY | By appointment · Mon–Fri |\nBombay | Bandra W, Mumbai | By appointment |\nPress | info@kshetejsareen.com | Media inquiries, image use | mailto:info@kshetejsareen.com',
  notesEyebrow:    '02 · Working notes',
  notesLeft:       'Lead time — Commissions typically book 3–6 weeks out. Print orders ship within 10 working days.\nTravel — Comfortable working internationally. Travel costs billed at actuals; no day-rate uplift.\nImage use & press — Press kit and high-res files available on request from info@kshetejsareen.com.',
  notesRight:      'Day rates — Available on request once project scope is clear. Half-day, full-day, and multi-day rates.\nUsage & licensing — All commissions include a 12-month editorial usage by default. Extended usage and exclusivity quoted separately.\nPrints — Editions of 12, printed in studio on Hahnemühle Photo Rag. Signed, numbered, and stamped on verso.',
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
  currentFolder, onSearch, onFolderChange, onSelectImage, onAssignUrl, onLoadMore, onClose,
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
  onClose: () => void
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
        <button className="adm-library-close-btn" onClick={onClose}>Hide ×</button>
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

// ─── MotionVideosPanel ────────────────────────────────────────────────────────

function MotionVideosPanel({
  videos,
  onChange,
}: {
  videos: MotionVideo[]
  onChange: (updated: MotionVideo[]) => Promise<void>
}) {
  const [urlInput, setUrlInput]       = useState('')
  const [titleInput, setTitleInput]   = useState('')
  const [yearInput, setYearInput]     = useState('')
  const [locInput, setLocInput]       = useState('')
  const [addError, setAddError]       = useState('')
  const [saving, setSaving]           = useState(false)

  const handleAdd = async () => {
    const ytId = extractYouTubeId(urlInput)
    if (!ytId) { setAddError('Could not find a YouTube video ID in that URL.'); return }
    setAddError('')
    const newVideo: MotionVideo = {
      id: `mv-${Date.now()}`,
      youtubeId: ytId,
      title: titleInput.trim(),
      year: yearInput.trim() || undefined,
      location: locInput.trim() || undefined,
    }
    setSaving(true)
    await onChange([...videos, newVideo])
    setSaving(false)
    setUrlInput(''); setTitleInput(''); setYearInput(''); setLocInput('')
  }

  const handleRemove = async (id: string) => {
    await onChange(videos.filter((v) => v.id !== id))
  }

  const moveVideo = async (id: string, dir: 'up' | 'down') => {
    const arr = [...videos]
    const idx = arr.findIndex((v) => v.id === id)
    if (idx < 0) return
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    await onChange(arr)
  }

  return (
    <div className="adm-motion-videos">
      <div className="adm-motion-videos-head">
        <span className="adm-motion-videos-title">Videos</span>
        <span className="adm-motion-videos-count">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add new video */}
      <div className="adm-motion-add">
        <input
          className="adm-motion-input"
          placeholder="YouTube URL or video ID"
          value={urlInput}
          onChange={(e) => { setUrlInput(e.target.value); setAddError('') }}
        />
        <div className="adm-motion-add-row">
          <input className="adm-motion-input adm-motion-input--sm" placeholder="Title" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
          <input className="adm-motion-input adm-motion-input--xs" placeholder="Year" value={yearInput} onChange={(e) => setYearInput(e.target.value)} />
          <input className="adm-motion-input adm-motion-input--sm" placeholder="Location" value={locInput} onChange={(e) => setLocInput(e.target.value)} />
        </div>
        {addError && <span className="adm-motion-error">{addError}</span>}
        <button className="adm-motion-add-btn" onClick={handleAdd} disabled={!urlInput.trim() || saving}>
          {saving ? 'Saving…' : 'Add video →'}
        </button>
      </div>

      {/* Video list */}
      {videos.length > 0 && (
        <div className="adm-motion-list">
          {videos.map((v, i) => (
            <div key={v.id} className="adm-motion-item">
              <img
                className="adm-motion-thumb"
                src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                alt={v.title || v.youtubeId}
              />
              <div className="adm-motion-item-info">
                <span className="adm-motion-item-title">{v.title || <em style={{ opacity: 0.4 }}>Untitled</em>}</span>
                <span className="adm-motion-item-meta">{[v.location, v.year].filter(Boolean).join(' · ')}</span>
                <span className="adm-motion-item-id">{v.youtubeId}</span>
              </div>
              <div className="adm-motion-item-actions">
                <button className="adm-motion-order-btn" onClick={() => moveVideo(v.id, 'up')} disabled={i === 0}>↑</button>
                <button className="adm-motion-order-btn" onClick={() => moveVideo(v.id, 'down')} disabled={i === videos.length - 1}>↓</button>
                <button className="adm-motion-remove-btn" onClick={() => handleRemove(v.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FontsPanel ───────────────────────────────────────────────────────────────

const SERIF_OPTIONS = ['Bodoni Moda', 'Cormorant Garamond', 'Playfair Display', 'IM Fell English', 'Libre Baskerville', 'Lora']
const MONO_OPTIONS  = ['JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'Space Mono', 'Courier Prime']
const SANS_OPTIONS  = ['Inter', 'DM Sans', 'Outfit', 'Plus Jakarta Sans']

const DEFAULT_SERIF = 'Bodoni Moda'
const DEFAULT_MONO  = 'JetBrains Mono'
const DEFAULT_SANS  = 'Inter'

type FontRole = 'serif' | 'mono' | 'sans'

type FontUseCase = {
  page: string
  label: string
  css: string
  example: string
  size: string
  italic?: boolean
  tracking?: string
}

const FONT_USE_CASES: Record<FontRole, FontUseCase[]> = {
  serif: [
    // Landing
    { page: 'Landing',  label: 'Photographer name',          css: '.ks-name',                   example: 'Kshetej Sareen',                                          size: '55–90px'   },
    { page: 'Landing',  label: 'Background counter numeral', css: '.ks-counter',                example: '02',                                                      size: '300px',    italic: true },
    // Menu
    { page: 'Menu',     label: 'Category name',              css: '.ks-menu-cat-name',          example: 'Culinary',                                                size: '28–48px'   },
    // Category pages
    { page: 'Category', label: 'Hero title',                 css: '.cat-hero-title',            example: 'Culinary.',                                               size: '72–220px', italic: true },
    { page: 'Category', label: 'Intro body text',            css: '.cat-intro-body',            example: 'A quieter approach to food photography — work made over weeks, not hours.', size: '24–36px' },
    { page: 'Category', label: 'Pull quote',                 css: '.cat-pull-quote-text',       example: '"Light is the subject. Everything else is context."',      size: '28–56px',  italic: true },
    { page: 'Category', label: 'Row count numeral',          css: '.cat-row-ct-num',            example: '01',                                                      size: '40px',     italic: true },
    { page: 'Category', label: 'Projects section heading',   css: '.cat-projects-title',        example: 'Selected work.',                                          size: '48–96px'   },
    { page: 'Category', label: 'Project card title',         css: '.cat-project-title',         example: 'Marriott Mumbai',                                         size: '26–40px'   },
    // Info page
    { page: 'Info',     label: 'Hero name',                  css: '.info-hero-name',            example: 'Kshetej Sareen',                                          size: '64–112px'  },
    { page: 'Info',     label: 'Hero intro paragraph',       css: '.info-hero-intro',           example: 'Independent photographer working between New York and Bombay.',             size: '17–22px'  },
    { page: 'Info',     label: 'Biography paragraphs',       css: '.info-bio-para',             example: 'The work begins before the camera is raised.',            size: '18–26px'   },
    { page: 'Info',     label: 'Portrait slot call-to-action', css: '.info-photo-slot-cta',     example: 'Add portrait photo',                                      size: '18–26px'   },
    // Contact page
    { page: 'Contact',  label: 'Hero title',                 css: '.contact-hero-title',        example: 'Say hello.',                                              size: '80–180px', italic: true },
    { page: 'Contact',  label: 'Inquiry section heading',    css: '.contact-inquiry-heading',   example: 'Project inquiry.',                                        size: '28–42px'   },
    { page: 'Contact',  label: 'Direct channels heading',    css: '.contact-direct-title',      example: 'Direct.',                                                 size: '48–88px',  italic: true },
    { page: 'Contact',  label: 'Direct channel values',      css: '.contact-direct-cell-value', example: 'kshetejsareen@gmail.com',                                 size: '18–26px'   },
    { page: 'Contact',  label: 'Working notes text',         css: '.contact-notes-val',         example: 'Response time: 24–48h',                                   size: '14–16px'   },
    { page: 'Contact',  label: 'Form text input',            css: '.contact-input-v2',          example: 'Your name here',                                          size: '16px',     italic: true },
    { page: 'Contact',  label: 'Confirmation heading',       css: '.contact-sent-mark',         example: '✓',                                                       size: '48px'      },
    // Project pages
    { page: 'Project',  label: 'Project hero title',         css: '.proj-hero-title',           example: 'Marriott Mumbai',                                         size: '36–88px',  italic: true },
  ],
  mono: [
    // All pages
    { page: 'All',      label: 'KS wordmark',                css: '.ks-wordmark-ks',            example: 'KS',                                                      size: '17px',  tracking: '0.22em' },
    { page: 'All',      label: 'Top nav links',              css: '.ks-top-nav a',              example: 'CULINARY · INFO · CONTACT',                               size: '15px',  tracking: '0.22em' },
    { page: 'All',      label: 'Menu open button',           css: '.ks-menu-btn',               example: 'MENU +',                                                  size: '15px',  tracking: '0.22em' },
    // Menu overlay
    { page: 'Menu',     label: 'Menu eyebrow',               css: '.ks-menu-eyebrow',           example: 'EXPLORE',                                                 size: '12px',  tracking: '0.28em' },
    { page: 'Menu',     label: 'Category numbers',           css: '.ks-menu-cat-n',             example: '01 · 02 · 03',                                            size: '12px',  tracking: '0.22em' },
    { page: 'Menu',     label: 'Utility links',              css: '.ks-menu-link',              example: 'INFO · CONTACT',                                          size: '12px',  tracking: '0.22em' },
    // Landing
    { page: 'Landing',  label: 'Brand bar label',            css: '.brand-bar-label',           example: 'TRUSTED BY',                                              size: '16px',  tracking: '0.18em' },
    { page: 'Landing',  label: 'Brand bar client names',     css: '.brand-bar-item',            example: 'MARRIOTT HOTELS & RESORTS',                               size: '16px',  tracking: '0.18em' },
    // Category pages
    { page: 'Category', label: 'Section eyebrow',            css: '.ks-eyebrow',                example: 'ON THE WORK',                                             size: '12px',  tracking: '0.22em' },
    { page: 'Category', label: 'Meta / stats eyebrow',       css: '.ks-meta .ks-eyebrow',       example: 'CULINARY · 2021–24',                                      size: '15px',  tracking: '0.22em' },
    { page: 'Category', label: 'Hero year range',            css: '.cat-hero-year',             example: '2021–2024',                                               size: '22px',  tracking: '0.18em' },
    { page: 'Category', label: 'Photo captions',             css: '.cat-cap',                   example: 'Studio · 2024 · Canon EOS R5',                            size: '13px',  tracking: '0.12em' },
    { page: 'Category', label: 'Pull quote attribution',     css: '.cat-pull-quote-attr',       example: '— K.S.',                                                  size: '15px',  tracking: '0.22em' },
    { page: 'Category', label: 'Project frames count',       css: '.cat-project-frames',        example: '14 frames',                                               size: '13px',  tracking: '0.18em' },
    { page: 'Category', label: 'Project metadata',           css: '.cat-project-meta',          example: 'New York · 2023',                                         size: '13px',  tracking: '0.18em' },
    { page: 'Category', label: 'Footer eyebrow',             css: '.cat-footer-nav-eyebrow',    example: 'EXPLORE',                                                 size: '16px',  tracking: '0.22em' },
    { page: 'Category', label: 'Footer nav links',           css: '.cat-footer-nav-link',       example: 'CULINARY · SPACES · PORTRAITS',                           size: '16px',  tracking: '0.22em' },
    { page: 'Category', label: 'Footer copyright',           css: '.cat-footer-copy',           example: '© 2026 KSHETEJ SAREEN',                                   size: '12px',  tracking: '0.12em' },
    // Contact page
    { page: 'Contact',  label: 'Form field labels',          css: '.contact-field-label',       example: 'FULL NAME',                                               size: '12px',  tracking: '0.22em' },
    { page: 'Contact',  label: 'Submit button',              css: '.contact-submit-v2',         example: 'SEND INQUIRY →',                                          size: '13px',  tracking: '0.22em' },
    // Project pages
    { page: 'Project',  label: 'Project hero stats',         css: '.proj-hero-stats',           example: '12 frames · 2023 · New York',                             size: '12px',  tracking: '0.2em'  },
  ],
  sans: [
    { page: 'All',      label: 'Default body text',          css: 'body',                       example: 'Independent photographer working between New York and Bombay. Portraits, interiors, objects.', size: '16px (base)' },
    { page: 'Category', label: 'Project description',        css: '.cat-project-desc',          example: 'A focused study of natural light in contemporary interiors.',                                   size: '18px'        },
    { page: 'Contact',  label: 'Form text inputs',           css: '.contact-input',             example: 'Full name · you@studio.com',                              size: '16px'        },
    { page: 'Contact',  label: 'Subline / supporting copy',  css: '.contact-subline',           example: 'Currently taking select commissions for 2026.',           size: '15px'        },
    { page: 'Contact',  label: 'Privacy & legal note',       css: '.contact-privacy',           example: 'Your details will not be shared with third parties.',     size: '11px'        },
  ],
}

function FontsPanel({
  config, onSave,
}: {
  config: FontConfig
  onSave: (cfg: FontConfig) => Promise<void>
}) {
  const [draft, setDraft]   = useState<FontConfig>(config)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const allFonts = [...SERIF_OPTIONS, ...MONO_OPTIONS, ...SANS_OPTIONS]
    const toLoad = allFonts.filter((f) => GFONTS[f])
    const href = `https://fonts.googleapis.com/css2?${toLoad.map((f) => `family=${GFONTS[f]}`).join('&')}&display=swap`
    if (!document.querySelector('link[data-ks-font-panel]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.setAttribute('data-ks-font-panel', '1')
      document.head.appendChild(link)
      link.onload = () => setLoaded(new Set(toLoad))
    } else {
      setLoaded(new Set(toLoad))
    }
  }, [])

  useEffect(() => { setDraft(config) }, [config])

  const dirty = JSON.stringify(draft) !== JSON.stringify(config)

  const handleSave = async () => {
    setSaving(true)
    await onSave(draft)
    setSaving(false)
  }

  const active = (role: FontRole) =>
    role === 'serif' ? (draft.serifFamily ?? DEFAULT_SERIF)
    : role === 'mono' ? (draft.monoFamily ?? DEFAULT_MONO)
    : (draft.sansFamily ?? DEFAULT_SANS)

  const setFont = (role: FontRole, family: string) =>
    setDraft((prev) => ({
      ...prev,
      ...(role === 'serif' ? { serifFamily: family }
        : role === 'mono'  ? { monoFamily:  family }
        : { sansFamily: family }),
    }))

  const fallback = (role: FontRole) =>
    role === 'serif' ? `'Bodoni 72', serif`
    : role === 'mono' ? `'Fira Code', monospace`
    : `system-ui, sans-serif`

  const isLoaded = (f: string) =>
    loaded.has(f) || f === DEFAULT_SERIF || f === DEFAULT_MONO || f === DEFAULT_SANS

  const renderBlock = (role: FontRole, title: string, options: string[]) => {
    const current = active(role)
    return (
      <div className="adm-fonts-block">
        <div className="adm-fonts-block-head">
          <span className="adm-fonts-role">{title}</span>
          <span className="adm-fonts-current">{current}</span>
        </div>

        <div className="adm-fonts-cases">
          {FONT_USE_CASES[role].map((uc) => (
            <div key={`${uc.page}-${uc.label}`} className="adm-fonts-case">
              <div className="adm-fonts-case-meta">
                <span className="adm-fonts-case-page">{uc.page}</span>
                <span className="adm-fonts-case-label">{uc.label}</span>
                <span className="adm-fonts-case-size">{uc.size}{uc.tracking ? ` · ${uc.tracking}` : ''}</span>
              </div>
              <span className="adm-fonts-case-css">{uc.css}</span>
              <div
                className="adm-fonts-case-example"
                style={{
                  fontFamily:    isLoaded(current) ? `'${current}', ${fallback(role)}` : fallback(role),
                  fontStyle:     uc.italic ? 'italic' : 'normal',
                  letterSpacing: uc.tracking,
                }}
              >
                {uc.example}
              </div>
            </div>
          ))}
        </div>

        <div className="adm-fonts-options">
          <span className="adm-fonts-options-label">Change to</span>
          <div className="adm-fonts-pills">
            {options.map((f) => (
              <button
                key={f}
                className={`adm-fonts-pill${current === f ? ' active' : ''}`}
                onClick={() => setFont(role, f)}
                style={{ fontFamily: isLoaded(f) ? `'${f}', ${fallback(role)}` : fallback(role) }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="adm-fonts-panel">
      <div className="adm-fonts-toolbar">
        <span className="adm-fonts-toolbar-title">Typography</span>
        {dirty && (
          <>
            <button className="adm-fonts-discard" onClick={() => setDraft(config)}>Discard</button>
            <button className="adm-fonts-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save fonts →'}
            </button>
          </>
        )}
      </div>
      {renderBlock('serif', 'Serif', SERIF_OPTIONS)}
      {renderBlock('mono',  'Mono',  MONO_OPTIONS)}
      {renderBlock('sans',  'Sans',  SANS_OPTIONS)}
    </div>
  )
}
