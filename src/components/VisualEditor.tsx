'use client'

import {
  useCallback, useEffect, useRef, useState, type CSSProperties,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Override {
  selector: string
  properties: Record<string, string>
}

interface DragState {
  startX: number
  startY: number
  origLeft: number
  origTop: number
  origPosition: string
  offsetParentRect: DOMRect
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EDITOR_CLASSES = /\bvse-/

function isEditorEl(el: Element): boolean {
  return !!el.closest('[data-vse]')
}

function getSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter((c) => !EDITOR_CLASSES.test(c))
    .slice(0, 3)
  const base = classes.length ? `${tag}.${classes.join('.')}` : tag

  // Walk up to root to get a more specific path (max 3 ancestors)
  const parts: string[] = [base]
  let cur = el.parentElement
  let depth = 0
  while (cur && cur !== document.body && depth < 3) {
    const pTag = cur.tagName.toLowerCase()
    const pCls = Array.from(cur.classList)
      .filter((c) => !EDITOR_CLASSES.test(c))
      .slice(0, 2)
    parts.unshift(pCls.length ? `${pTag}.${pCls.join('.')}` : pTag)
    cur = cur.parentElement
    depth++
  }
  return parts.join(' > ')
}

function px(v: string): string { return v ? v.replace(/[^0-9.-]/g, '') : '' }
function unit(v: string): string {
  const m = v.match(/[a-z%]+$/i)
  return m ? m[0] : 'px'
}

// ─── VisualEditor ─────────────────────────────────────────────────────────────

export function VisualEditor({ pageId }: { pageId: string }) {
  const [isAdmin, setIsAdmin]         = useState(false)
  const [editMode, setEditMode]       = useState(false)
  const [overrides, setOverrides]     = useState<Override[]>([])
  const [selected, setSelected]       = useState<HTMLElement | null>(null)
  const [hoveredEl, setHoveredEl]     = useState<HTMLElement | null>(null)
  const [props, setProps]             = useState<Record<string, string>>({})
  const [tab, setTab]                 = useState<'type' | 'space' | 'pos'>('type')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [dragging, setDragging]       = useState(false)
  const dragRef                       = useRef<DragState | null>(null)
  const styleTagRef                   = useRef<HTMLStyleElement | null>(null)

  // ── Admin check ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/config').then((r) => { if (r.ok) setIsAdmin(true) }).catch(() => {})
  }, [])

  // ── Load saved overrides & inject stylesheet ──────────────────────────────
  useEffect(() => {
    if (!pageId) return
    fetch(`/api/admin/visual-overrides?page=${pageId}`)
      .then((r) => r.json())
      .then(({ overrides: ov }) => {
        setOverrides(ov ?? [])
        applyStylesheet(ov ?? [])
      })
      .catch(() => {})
  }, [pageId])

  const applyStylesheet = useCallback((ov: Override[]) => {
    if (!styleTagRef.current) {
      const style = document.createElement('style')
      style.id = 'ks-visual-overrides'
      document.head.appendChild(style)
      styleTagRef.current = style
    }
    styleTagRef.current.textContent = ov
      .map((o) =>
        `${o.selector} { ${Object.entries(o.properties)
          .map(([k, v]) => `${k}: ${v} !important`)
          .join('; ')} }`,
      )
      .join('\n')
  }, [])

  // ── Edit mode mouse handlers ──────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return

    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!isEditorEl(t)) setHoveredEl(t)
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (isEditorEl(t)) return
      e.preventDefault()
      e.stopPropagation()
      selectElement(t)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); setHoveredEl(null) }
    }

    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey)
      setHoveredEl(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, overrides])

  // ── Hover + selection outlines ────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return
    const hover = hoveredEl
    if (hover && hover !== selected) {
      hover.style.outline = '1px dashed rgba(120,160,255,0.7)'
      hover.style.outlineOffset = '2px'
    }
    return () => {
      if (hover && hover !== selected) {
        hover.style.outline = ''
        hover.style.outlineOffset = ''
      }
    }
  }, [hoveredEl, selected, editMode])

  useEffect(() => {
    if (!editMode) {
      selected?.style.setProperty('outline', '')
      return
    }
    if (selected) {
      selected.style.outline = '2px solid rgba(120,160,255,0.9)'
      selected.style.outlineOffset = '2px'
    }
    return () => { selected?.style.setProperty('outline', '') }
  }, [selected, editMode])

  // ── Select element ────────────────────────────────────────────────────────
  const selectElement = useCallback((el: HTMLElement) => {
    setSelected(el)
    const selector = getSelector(el)
    const existing = overrides.find((o) => o.selector === selector)
    const computed = window.getComputedStyle(el)

    const read = (prop: string) =>
      existing?.properties[prop] ?? el.style.getPropertyValue(prop) ?? ''

    setProps({
      selector,
      'font-size':      read('font-size')      || computed.fontSize,
      'font-family':    read('font-family')     || computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
      'font-weight':    read('font-weight')     || computed.fontWeight,
      'color':          read('color')           || rgbToHex(computed.color),
      'background-color': read('background-color') || (computed.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : rgbToHex(computed.backgroundColor)),
      'letter-spacing': read('letter-spacing')  || computed.letterSpacing,
      'line-height':    read('line-height')     || computed.lineHeight,
      'text-align':     read('text-align')      || computed.textAlign,
      'margin-top':     read('margin-top')      || computed.marginTop,
      'margin-right':   read('margin-right')    || computed.marginRight,
      'margin-bottom':  read('margin-bottom')   || computed.marginBottom,
      'margin-left':    read('margin-left')     || computed.marginLeft,
      'padding-top':    read('padding-top')     || computed.paddingTop,
      'padding-right':  read('padding-right')   || computed.paddingRight,
      'padding-bottom': read('padding-bottom')  || computed.paddingBottom,
      'padding-left':   read('padding-left')    || computed.paddingLeft,
      'width':          read('width')           || '',
      'height':         read('height')          || '',
      'top':            read('top')             || '',
      'left':           read('left')            || '',
      'position':       read('position')        || computed.position,
      'opacity':        read('opacity')         || '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides])

  // ── Update a property live ────────────────────────────────────────────────
  const setProp = useCallback((key: string, value: string) => {
    setProps((prev) => {
      const next = { ...prev, [key]: value }
      if (selected && value) {
        selected.style.setProperty(key, value)
      } else if (selected && !value) {
        selected.style.removeProperty(key)
      }
      return next
    })
  }, [selected])

  // ── Commit current props into the overrides list ──────────────────────────
  const commitOverride = useCallback(() => {
    const selector = props.selector
    if (!selector) return
    const properties: Record<string, string> = {}
    for (const [k, v] of Object.entries(props)) {
      if (k === 'selector' || !v) continue
      properties[k] = v
    }
    setOverrides((prev) => {
      const filtered = prev.filter((o) => o.selector !== selector)
      const next = Object.keys(properties).length
        ? [...filtered, { selector, properties }]
        : filtered
      applyStylesheet(next)
      return next
    })
  }, [props, applyStylesheet])

  // ── Save to Firestore ─────────────────────────────────────────────────────
  const save = useCallback(async () => {
    commitOverride()
    setSaving(true)
    try {
      await fetch('/api/admin/visual-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageId, overrides }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitOverride, pageId, overrides])

  // ── Remove override for current element ───────────────────────────────────
  const resetSelected = useCallback(() => {
    const selector = props.selector
    if (!selector || !selected) return
    // Remove all inline styles set by editor
    selected.removeAttribute('style')
    setOverrides((prev) => {
      const next = prev.filter((o) => o.selector !== selector)
      applyStylesheet(next)
      return next
    })
    setSelected(null)
  }, [props.selector, selected, applyStylesheet])

  // ── Drag to reposition ────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent) => {
    if (!selected) return
    e.preventDefault()
    const rect = selected.getBoundingClientRect()
    const parentEl = selected.offsetParent as HTMLElement | null
    const parentRect = parentEl ? parentEl.getBoundingClientRect() : { top: 0, left: 0 } as DOMRect
    const computed = window.getComputedStyle(selected)

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left - parentRect.left,
      origTop: rect.top - parentRect.top,
      origPosition: computed.position,
      offsetParentRect: parentRect as DOMRect,
    }

    // Switch to absolute so we can freely position
    selected.style.position = 'absolute'
    selected.style.left = `${rect.left - parentRect.left}px`
    selected.style.top = `${rect.top - parentRect.top}px`
    setDragging(true)

    const onMouseMove = (ev: MouseEvent) => {
      if (!selected || !dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      const newLeft = dragRef.current.origLeft + dx
      const newTop  = dragRef.current.origTop  + dy
      selected.style.left = `${newLeft}px`
      selected.style.top  = `${newTop}px`
    }
    const onMouseUp = () => {
      setDragging(false)
      dragRef.current = null
      if (selected) {
        const newLeft = selected.style.left
        const newTop  = selected.style.top
        setProp('position', 'absolute')
        setProp('left', newLeft)
        setProp('top', newTop)
      }
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [selected, setProp])

  // ── body class for panel width offset ────────────────────────────────────
  useEffect(() => {
    if (editMode && selected) document.body.classList.add('vse-active')
    else document.body.classList.remove('vse-active')
    return () => document.body.classList.remove('vse-active')
  }, [editMode, selected])

  // ── Turn off edit mode cleanly ────────────────────────────────────────────
  const toggleEdit = () => {
    if (editMode) {
      setEditMode(false)
      setSelected(null)
      setHoveredEl(null)
    } else {
      setEditMode(true)
    }
  }

  if (!isAdmin) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating toggle button */}
      <button
        data-vse
        className={`vse-toggle${editMode ? ' active' : ''}`}
        onClick={toggleEdit}
        title="Visual editor"
      >
        {editMode ? '✕ Exit' : '✏ Edit'}
      </button>

      {/* Inspector panel */}
      {editMode && selected && (
        <div data-vse className="vse-panel">
          {/* Selector */}
          <div className="vse-selector" title={props.selector}>
            <span className="vse-selector-label">Element</span>
            <code className="vse-selector-val">{props.selector?.split(' > ').pop()}</code>
          </div>

          {/* Tabs */}
          <div className="vse-tabs">
            {(['type', 'space', 'pos'] as const).map((t) => (
              <button key={t} className={`vse-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'type' ? 'Type' : t === 'space' ? 'Space' : 'Pos'}
              </button>
            ))}
          </div>

          <div className="vse-fields">
            {tab === 'type' && (
              <>
                <VseRow label="Size">
                  <VseNumInput value={props['font-size']} onChange={(v) => setProp('font-size', v)} />
                </VseRow>
                <VseRow label="Family">
                  <input className="vse-input" value={props['font-family'] ?? ''} onChange={(e) => setProp('font-family', e.target.value)} />
                </VseRow>
                <VseRow label="Weight">
                  <select className="vse-select" value={props['font-weight'] ?? ''} onChange={(e) => setProp('font-weight', e.target.value)}>
                    {['100','200','300','400','500','600','700','800','900'].map((w) => <option key={w}>{w}</option>)}
                  </select>
                </VseRow>
                <VseRow label="Color">
                  <VseColorInput value={props['color'] ?? ''} onChange={(v) => setProp('color', v)} />
                </VseRow>
                <VseRow label="Bg">
                  <VseColorInput value={props['background-color'] ?? ''} onChange={(v) => setProp('background-color', v)} />
                </VseRow>
                <VseRow label="Align">
                  <div className="vse-align-row">
                    {['left','center','right'].map((a) => (
                      <button key={a} className={`vse-align-btn${props['text-align'] === a ? ' active' : ''}`}
                        onClick={() => setProp('text-align', a)}>{a[0].toUpperCase()}</button>
                    ))}
                  </div>
                </VseRow>
                <VseRow label="L-Spc">
                  <VseNumInput value={props['letter-spacing']} onChange={(v) => setProp('letter-spacing', v)} />
                </VseRow>
                <VseRow label="L-Hgt">
                  <VseNumInput value={props['line-height']} onChange={(v) => setProp('line-height', v)} />
                </VseRow>
                <VseRow label="Opacity">
                  <VseNumInput value={props['opacity']} onChange={(v) => setProp('opacity', v)} defaultUnit="" />
                </VseRow>
              </>
            )}

            {tab === 'space' && (
              <>
                <div className="vse-box-label">Margin</div>
                <div className="vse-box4">
                  {(['margin-top','margin-right','margin-bottom','margin-left'] as const).map((k) => (
                    <VseBox4Input key={k} label={k.replace('margin-', '')} value={props[k] ?? ''} onChange={(v) => setProp(k, v)} />
                  ))}
                </div>
                <div className="vse-box-label">Padding</div>
                <div className="vse-box4">
                  {(['padding-top','padding-right','padding-bottom','padding-left'] as const).map((k) => (
                    <VseBox4Input key={k} label={k.replace('padding-', '')} value={props[k] ?? ''} onChange={(v) => setProp(k, v)} />
                  ))}
                </div>
                <VseRow label="Width">
                  <VseNumInput value={props['width']} onChange={(v) => setProp('width', v)} />
                </VseRow>
                <VseRow label="Height">
                  <VseNumInput value={props['height']} onChange={(v) => setProp('height', v)} />
                </VseRow>
              </>
            )}

            {tab === 'pos' && (
              <>
                <div className="vse-drag-hint">
                  Drag to reposition the selected element.
                  This sets <code>position: absolute</code>.
                </div>
                <button className="vse-drag-btn" onMouseDown={startDrag}>
                  {dragging ? 'Dragging…' : '⊹ Drag element'}
                </button>
                <VseRow label="Position">
                  <select className="vse-select" value={props['position'] ?? ''} onChange={(e) => setProp('position', e.target.value)}>
                    {['','static','relative','absolute','fixed','sticky'].map((v) => <option key={v} value={v}>{v || '—'}</option>)}
                  </select>
                </VseRow>
                <VseRow label="Top">
                  <VseNumInput value={props['top']} onChange={(v) => setProp('top', v)} />
                </VseRow>
                <VseRow label="Left">
                  <VseNumInput value={props['left']} onChange={(v) => setProp('left', v)} />
                </VseRow>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="vse-actions">
            <button className="vse-btn-reset" onClick={resetSelected}>Reset</button>
            <button className="vse-btn-save" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save page'}
            </button>
          </div>
        </div>
      )}

      {/* Save shortcut when no element selected */}
      {editMode && !selected && overrides.length > 0 && (
        <button data-vse className="vse-save-float" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save page'}
        </button>
      )}
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function VseRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="vse-row">
      <span className="vse-row-label">{label}</span>
      <div className="vse-row-ctrl">{children}</div>
    </div>
  )
}

function VseNumInput({ value, onChange, defaultUnit = 'px' }: {
  value: string; onChange: (v: string) => void; defaultUnit?: string
}) {
  const num = px(value || '')
  const u   = value ? unit(value) : defaultUnit
  return (
    <div className="vse-num-wrap">
      <input className="vse-input vse-num" type="number" value={num}
        onChange={(e) => onChange(e.target.value + u)} />
      <select className="vse-unit" value={u} onChange={(e) => onChange((num || '0') + e.target.value)}>
        {['px','em','rem','%','vw','vh',''].map((un) => <option key={un} value={un}>{un || '—'}</option>)}
      </select>
    </div>
  )
}

function VseColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = value?.startsWith('#') ? value : (value ? rgbToHex(value) : '#000000')
  return (
    <div className="vse-color-wrap">
      <input type="color" className="vse-color-swatch" value={hex} onChange={(e) => onChange(e.target.value)} />
      <input className="vse-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#hex / rgba" />
    </div>
  )
}

function VseBox4Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const num = px(value || '')
  const u   = value ? unit(value) : 'px'
  return (
    <div className="vse-box4-item">
      <span className="vse-box4-lbl">{label}</span>
      <input className="vse-input vse-num" type="number" value={num}
        onChange={(e) => onChange(e.target.value + u)} />
    </div>
  )
}

// ─── Util ──────────────────────────────────────────────────────────────────────

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g)
  if (!m || m.length < 3) return '#000000'
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')
}
