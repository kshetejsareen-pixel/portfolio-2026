'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLandingSlots, GALLERY_SLOTS, PAGES, type Slot } from '@/lib/slots'
import { categories } from '@/lib/categories'

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
  imageCount?: number
  coverUrl?: string | null
}

type LandingConfig = Record<string, number>

type RightPanel =
  | { mode: 'library' }
  | { mode: 'copy-editor'; slotId: string; publicId: string; initial: ImageCopy }
  | { mode: 'folder-browser'; categoryId: string }

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

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminPanel() {
  // Library
  const [images, setImages]             = useState<CloudinaryImage[]>([])
  const [nextCursor, setNextCursor]     = useState<string | null>(null)
  const [loadingImages, setLoadingImages] = useState(false)
  const [searchQ, setSearchQ]           = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Assignments + config
  const [assignments, setAssignments]   = useState<Record<string, Assignment>>({})
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    culinary: 4, spaces: 3, portraits: 5, objects: 3, motion: 2,
  })
  const [configSaving, setConfigSaving] = useState<string | null>(null)

  // Projects
  const [projects, setProjects]         = useState<Record<string, AdminProject[]>>({})

  // Selection / panel state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [activePage, setActivePage]     = useState('Landing')
  const [assigning, setAssigning]       = useState(false)
  const [rightPanel, setRightPanel]     = useState<RightPanel>({ mode: 'library' })
  const [toast, setToast]               = useState('')

  // Derived
  const landingSlots  = getLandingSlots(landingConfig)
  const pageSlots     = activePage === 'Landing'
    ? landingSlots
    : GALLERY_SLOTS.filter((s) => s.page === activePage)
  const activeCatId   = activePage.toLowerCase()

  // ── Fetch library ──────────────────────────────────────────────────────────
  const fetchImages = useCallback(async (q: string, cursor?: string) => {
    setLoadingImages(true)
    const params = new URLSearchParams()
    if (q)      params.set('q', q)
    if (cursor) params.set('cursor', cursor)
    const data = await fetch(`/api/admin/images?${params}`).then((r) => r.json())
    setImages((prev) => cursor ? [...prev, ...data.images] : data.images)
    setNextCursor(data.next_cursor ?? null)
    setLoadingImages(false)
  }, [])

  // ── Fetch assignments ──────────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    const data = await fetch('/api/admin/assignments').then((r) => r.json())
    setAssignments(data.assignments ?? {})
  }, [])

  // ── Fetch landing config ───────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    const data = await fetch('/api/admin/config').then((r) => r.json())
    if (data.config) setLandingConfig(data.config)
  }, [])

  // ── Fetch projects ─────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    const data = await fetch('/api/admin/projects').then((r) => r.json())
    if (data.projects) setProjects(data.projects)
  }, [])

  useEffect(() => {
    fetchImages('')
    fetchAssignments()
    fetchConfig()
    fetchProjects()
  }, [fetchImages, fetchAssignments, fetchConfig, fetchProjects])

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearchQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setImages([])
      setNextCursor(null)
      fetchImages(q)
    }, 400)
  }

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

  // ── Unassign slot ──────────────────────────────────────────────────────────
  const unassignSlot = async (slot: Slot) => {
    const asgn = assignments[slot.id]
    if (!asgn) return
    await fetch('/api/admin/assign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: asgn.publicId }),
    })
    await fetchAssignments()
    showToast('Slot cleared')
  }

  // ── Open copy editor ───────────────────────────────────────────────────────
  const openCopyEditor = async (slot: Slot) => {
    const asgn = assignments[slot.id]
    if (!asgn) return
    const data = await fetch(`/api/admin/image-meta?publicId=${encodeURIComponent(asgn.publicId)}`).then((r) => r.json())
    // Pre-fill from Cloudinary context; fall back to static categories.ts data
    const cat   = categories.find((c) => slot.id.startsWith(`landing-${c.id}-`))
    const idx   = parseInt(slot.id.split('-').pop() ?? '0', 10)
    const base  = cat?.frames[idx]
    setRightPanel({
      mode: 'copy-editor',
      slotId: slot.id,
      publicId: asgn.publicId,
      initial: {
        title:    data.title    || base?.title    || '',
        location: data.location || base?.location || '',
        year:     data.year     || base?.year     || '',
        camera:   data.camera   || base?.camera   || '',
      },
    })
    setSelectedSlot(null)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const landingGroups = LANDING_CATS.map((cat) => {
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
          {selectedSlot && (
            <div className="adm-selecting-badge">
              Selecting for: <strong>{selectedSlot.label}</strong>
              <button className="adm-cancel-select" onClick={() => setSelectedSlot(null)}>Cancel ×</button>
            </div>
          )}
        </div>

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
                  {g.slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      assignment={assignments[slot.id]}
                      selected={selectedSlot?.id === slot.id}
                      onSelect={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                      onClear={() => unassignSlot(slot)}
                      onEditCopy={() => openCopyEditor(slot)}
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
                onEditCopy={() => openCopyEditor(slot)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      {rightPanel.mode === 'copy-editor' ? (
        <CopyEditorPanel
          key={rightPanel.slotId}
          publicId={rightPanel.publicId}
          initial={rightPanel.initial}
          onSave={async (copy) => {
            await fetch('/api/admin/image-meta', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: rightPanel.publicId, ...copy }),
            })
            showToast('Copy saved')
            setRightPanel({ mode: 'library' })
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
      ) : (
        <LibraryPanel
          images={images}
          nextCursor={nextCursor}
          loadingImages={loadingImages}
          searchQ={searchQ}
          selectedSlot={selectedSlot}
          assigning={assigning}
          onSearch={handleSearch}
          onSelectImage={assignImage}
          onLoadMore={() => fetchImages(searchQ, nextCursor ?? undefined)}
        />
      )}

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}

// ─── SlotCard ─────────────────────────────────────────────────────────────────

function SlotCard({
  slot, assignment, selected, onSelect, onClear, onEditCopy,
}: {
  slot: Slot
  assignment?: Assignment
  selected: boolean
  onSelect: () => void
  onClear: () => void
  onEditCopy: () => void
}) {
  return (
    <div className={`adm-slot${selected ? ' selecting' : ''}${assignment ? ' assigned' : ''}`}>
      {assignment ? (
        <div className="adm-slot-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assignment.thumbnailUrl} alt={slot.label} className="adm-slot-img" />
        </div>
      ) : (
        <div className="adm-slot-empty"><span className="adm-slot-empty-icon">+</span></div>
      )}
      <div className="adm-slot-meta">
        <div className="adm-slot-label">{slot.label}</div>
        <div className="adm-slot-hint">{slot.hint}</div>
        <div className="adm-slot-actions">
          <button className="adm-slot-assign-btn" onClick={onSelect}>
            {selected ? 'Cancel' : assignment ? 'Replace' : 'Assign'}
          </button>
          {assignment && (
            <>
              <button className="adm-slot-copy-btn" onClick={onEditCopy} title="Edit copy">✏</button>
              <button className="adm-slot-clear-btn" onClick={onClear}>Clear</button>
            </>
          )}
        </div>
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
  categoryId, projects, onAdd, onRemove,
}: {
  categoryId: string
  projects: AdminProject[]
  onAdd: () => void
  onRemove: (id: string) => void
}) {
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

      {projects.length === 0 ? (
        <div className="adm-projects-empty">
          No projects yet. Add a Cloudinary folder to create one.
        </div>
      ) : (
        <div className="adm-projects-list">
          {projects.map((p) => (
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
                <div className="adm-project-folder">{p.folder}</div>
              </div>
              <button className="adm-project-remove" onClick={() => onRemove(p.id)} title="Remove project">×</button>
            </div>
          ))}
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
  const [form, setForm]               = useState({ title: '', it: '', year: '', location: '', desc: '' })
  const [saving, setSaving]           = useState(false)

  const loadFolders = useCallback(async (p: string) => {
    setLoading(true)
    const data = await fetch(`/api/admin/folders?path=${encodeURIComponent(p)}`).then((r) => r.json())
    setFolders(data.folders ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadFolders('') }, [loadFolders])

  const navigateTo = (p: string) => {
    setPath(p)
    setSelectedFolder(null)
    loadFolders(p)
  }

  const selectFolder = (f: CloudinaryFolder) => {
    setSelectedFolder(f)
    setForm((prev) => ({ ...prev, title: f.name.replace(/[-_]/g, ' ') }))
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

      {/* Folder list */}
      <div className="adm-folder-list">
        {loading && <div className="adm-library-loading">Loading folders…</div>}
        {!loading && folders.length === 0 && (
          <div className="adm-library-loading">No subfolders here.</div>
        )}
        {folders.map((f) => (
          <button
            key={f.path}
            className={`adm-folder-item${selectedFolder?.path === f.path ? ' selected' : ''}`}
            onClick={() => selectFolder(f)}
            onDoubleClick={() => navigateTo(f.path)}
          >
            <span className="adm-folder-icon">📁</span>
            <span className="adm-folder-name">{f.name}</span>
            <span className="adm-folder-count">{f.imageCount} img</span>
            <span className="adm-folder-nav" onClick={(e) => { e.stopPropagation(); navigateTo(f.path) }}>→</span>
          </button>
        ))}
      </div>

      {/* Project form — shown when folder is selected */}
      {selectedFolder && (
        <div className="adm-folder-form">
          <div className="adm-folder-form-title">
            Adding: <strong>{selectedFolder.path}</strong>
            <span className="adm-folder-form-count">({selectedFolder.imageCount} images)</span>
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

// ─── LibraryPanel ─────────────────────────────────────────────────────────────

function LibraryPanel({
  images, nextCursor, loadingImages, searchQ, selectedSlot, assigning,
  onSearch, onSelectImage, onLoadMore,
}: {
  images: CloudinaryImage[]
  nextCursor: string | null
  loadingImages: boolean
  searchQ: string
  selectedSlot: Slot | null
  assigning: boolean
  onSearch: (q: string) => void
  onSelectImage: (img: CloudinaryImage) => void
  onLoadMore: () => void
}) {
  return (
    <aside className="adm-library">
      <div className="adm-library-head">
        <div className="adm-library-title">Cloudinary Library</div>
        <input
          className="adm-library-search"
          type="search"
          placeholder="Search…"
          value={searchQ}
          onChange={(e) => onSearch(e.target.value)}
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
      </div>

      {loadingImages && <div className="adm-library-loading">Loading…</div>}
      {nextCursor && !loadingImages && (
        <button className="adm-load-more" onClick={onLoadMore}>Load more</button>
      )}
    </aside>
  )
}
