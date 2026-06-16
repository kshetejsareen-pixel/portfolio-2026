'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Override {
  selector: string
  properties: Record<string, string>
}

interface HistoryEntry {
  overrides: Override[]
  props: Record<string, string>
  elStyle: string   // snapshot of selected element's style attribute
}

interface DragState {
  startX: number; startY: number
  baseX: number; baseY: number   // existing translate before drag started
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEditorEl(el: Element): boolean { return !!el.closest('[data-vse]') }

function getSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const cls = Array.from(el.classList).filter((c) => !/\bvse-/.test(c)).slice(0, 3)
  const base = cls.length ? `${tag}.${cls.join('.')}` : tag
  const parts = [base]
  let cur = el.parentElement
  for (let d = 0; cur && cur !== document.body && d < 3; d++, cur = cur.parentElement) {
    const pc = Array.from(cur.classList).filter((c) => !/\bvse-/.test(c)).slice(0, 2)
    parts.unshift(pc.length ? `${cur.tagName.toLowerCase()}.${pc.join('.')}` : cur.tagName.toLowerCase())
  }
  return parts.join(' > ')
}

function px(v: string) { return v ? v.replace(/[^0-9.-]/g, '') : '' }
function unit(v: string) { const m = v.match(/[a-z%]+$/i); return m ? m[0] : 'px' }
function parseTranslate(tf: string): [number, number] {
  const m = tf?.match(/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/)
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0]
}
function rgbToHex(rgb: string) {
  const m = rgb.match(/\d+/g)
  if (!m || m.length < 3) return '#000000'
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')
}

// ─── VisualEditor ─────────────────────────────────────────────────────────────

export function VisualEditor({ pageId }: { pageId: string }) {
  const [isAdmin, setIsAdmin]     = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [selected, setSelected]   = useState<HTMLElement | null>(null)
  const [hovered, setHovered]     = useState<HTMLElement | null>(null)
  const [props, setProps]         = useState<Record<string, string>>({})
  const [tab, setTab]             = useState<'type' | 'space' | 'pos'>('type')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [dragging, setDragging]   = useState(false)
  const [elRect, setElRect]       = useState<DOMRect | null>(null)
  const [canUndo, setCanUndo]     = useState(false)

  const styleTagRef  = useRef<HTMLStyleElement | null>(null)
  const dragRef      = useRef<DragState | null>(null)
  const historyRef   = useRef<HistoryEntry[]>([])
  const overridesRef = useRef(overrides)
  const propsRef     = useRef(props)
  overridesRef.current = overrides
  propsRef.current     = props

  // ── Admin check ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/config').then((r) => { if (r.ok) setIsAdmin(true) }).catch(() => {})
  }, [])

  // ── Load & inject overrides ────────────────────────────────────────────────
  useEffect(() => {
    if (!pageId) return
    fetch(`/api/admin/visual-overrides?page=${pageId}`)
      .then((r) => r.json())
      .then(({ overrides: ov }) => { setOverrides(ov ?? []); applyStylesheet(ov ?? []) })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const applyStylesheet = useCallback((ov: Override[]) => {
    if (!styleTagRef.current) {
      const s = document.createElement('style')
      s.id = 'ks-visual-overrides'
      document.head.appendChild(s)
      styleTagRef.current = s
    }
    const safe = Array.isArray(ov) ? ov.filter(
      (o) => o && typeof o.selector === 'string' && o.properties && typeof o.properties === 'object'
    ) : []
    styleTagRef.current.textContent = safe
      .map((o) => `${o.selector}{${Object.entries(o.properties).map(([k,v]) => `${k}:${v}!important`).join(';')}}`)
      .join('\n')
  }, [])

  // ── History ────────────────────────────────────────────────────────────────
  const pushHistory = useCallback(() => {
    historyRef.current.push({
      overrides: JSON.parse(JSON.stringify(overridesRef.current)),
      props: { ...propsRef.current },
      elStyle: selected?.getAttribute('style') ?? '',
    })
    if (historyRef.current.length > 50) historyRef.current.shift()
    setCanUndo(true)
  }, [selected])

  const undo = useCallback(() => {
    const entry = historyRef.current.pop()
    if (!entry) { setCanUndo(false); return }
    setCanUndo(historyRef.current.length > 0)
    setOverrides(entry.overrides)
    setProps(entry.props)
    applyStylesheet(entry.overrides)
    if (selected) {
      if (entry.elStyle) selected.setAttribute('style', entry.elStyle)
      else selected.removeAttribute('style')
    }
  }, [selected, applyStylesheet])

  // ── Keyboard: Esc deselect, Cmd+Z undo ────────────────────────────────────
  useEffect(() => {
    if (!editMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); setHovered(null) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editMode, undo])

  // ── Hover & click in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return
    const onMove = (e: MouseEvent) => { if (!isEditorEl(e.target as Element)) setHovered(e.target as HTMLElement) }
    const onClick = (e: MouseEvent) => {
      if (isEditorEl(e.target as Element)) return
      e.preventDefault(); e.stopPropagation()
      selectElement(e.target as HTMLElement)
    }
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      setHovered(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, overrides])

  // ── Hover outline ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode || !hovered || hovered === selected) return
    hovered.style.outline = '1px dashed rgba(120,160,255,0.6)'
    hovered.style.outlineOffset = '2px'
    return () => { if (hovered !== selected) { hovered.style.outline = ''; hovered.style.outlineOffset = '' } }
  }, [hovered, selected, editMode])

  // ── Selection outline ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode || !selected) return
    selected.style.outline = '2px solid rgba(120,160,255,0.9)'
    selected.style.outlineOffset = '2px'
    return () => { selected.style.outline = ''; selected.style.outlineOffset = '' }
  }, [selected, editMode])

  // ── Track selected element rect (for drag handle) ─────────────────────────
  useEffect(() => {
    if (!selected) { setElRect(null); return }
    const update = () => setElRect(selected.getBoundingClientRect())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(selected)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [selected])

  // ── Select element ─────────────────────────────────────────────────────────
  const selectElement = useCallback((el: HTMLElement) => {
    setSelected(el)
    const selector = getSelector(el)
    const existing = overridesRef.current.find((o) => o.selector === selector)
    const cs = window.getComputedStyle(el)
    const r = (p: string) => existing?.properties[p] ?? el.style.getPropertyValue(p) ?? ''
    setProps({
      selector,
      'font-size':        r('font-size')        || cs.fontSize,
      'font-family':      r('font-family')       || cs.fontFamily.split(',')[0].replace(/['"]/g,'').trim(),
      'font-weight':      r('font-weight')       || cs.fontWeight,
      'color':            r('color')             || rgbToHex(cs.color),
      'background-color': r('background-color')  || (cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : rgbToHex(cs.backgroundColor)),
      'letter-spacing':   r('letter-spacing')    || cs.letterSpacing,
      'line-height':      r('line-height')       || cs.lineHeight,
      'text-align':       r('text-align')        || cs.textAlign,
      'margin-top':       r('margin-top')        || cs.marginTop,
      'margin-right':     r('margin-right')      || cs.marginRight,
      'margin-bottom':    r('margin-bottom')     || cs.marginBottom,
      'margin-left':      r('margin-left')       || cs.marginLeft,
      'padding-top':      r('padding-top')       || cs.paddingTop,
      'padding-right':    r('padding-right')     || cs.paddingRight,
      'padding-bottom':   r('padding-bottom')    || cs.paddingBottom,
      'padding-left':     r('padding-left')      || cs.paddingLeft,
      'width':            r('width')             || '',
      'height':           r('height')            || '',
      'top':              r('top')               || '',
      'left':             r('left')              || '',
      'position':         r('position')          || cs.position,
      'opacity':          r('opacity')           || '',
      'transform':        r('transform')         || el.style.transform || '',
    })
  }, [])

  // ── Set a single property live ─────────────────────────────────────────────
  // 'important' priority wins over CSS animations AND over !important in stylesheets,
  // so dragging animated elements (e.g. ks-drift-mark on the KS mark) works correctly.
  const setProp = useCallback((key: string, value: string) => {
    setProps((prev) => {
      if (selected) {
        if (value) selected.style.setProperty(key, value, 'important')
        else selected.style.removeProperty(key)
      }
      return { ...prev, [key]: value }
    })
  }, [selected])

  // Push history on first focus of any panel input (once per "edit session")
  const didPushForFocus = useRef(false)
  const onInputFocus = useCallback(() => {
    if (!didPushForFocus.current) { pushHistory(); didPushForFocus.current = true }
  }, [pushHistory])
  // Reset the flag when a new element is selected
  useEffect(() => { didPushForFocus.current = false }, [selected])

  // ── Commit props → overrides list ──────────────────────────────────────────
  const commitOverride = useCallback(() => {
    const selector = propsRef.current.selector
    if (!selector) return
    const properties: Record<string, string> = {}
    for (const [k, v] of Object.entries(propsRef.current)) {
      if (k !== 'selector' && v) properties[k] = v
    }
    setOverrides((prev) => {
      const filtered = prev.filter((o) => o.selector !== selector)
      const next = Object.keys(properties).length ? [...filtered, { selector, properties }] : filtered
      applyStylesheet(next)
      return next
    })
  }, [applyStylesheet])

  // ── Save to Firestore ──────────────────────────────────────────────────────
  const save = useCallback(async () => {
    commitOverride()
    setSaving(true)
    try {
      await fetch('/api/admin/visual-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageId, overrides: overridesRef.current }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }, [commitOverride, pageId])

  // ── Clear all overrides for this page ─────────────────────────────────────
  const clearPage = useCallback(async () => {
    if (!confirm(`Clear ALL saved overrides for "${pageId}"? This cannot be undone.`)) return
    setOverrides([])
    applyStylesheet([])
    setSelected(null)
    await fetch('/api/admin/visual-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pageId, overrides: [] }),
    }).catch(() => {})
  }, [pageId, applyStylesheet])

  // ── Reset element ──────────────────────────────────────────────────────────
  const resetSelected = useCallback(() => {
    if (!selected) return
    pushHistory()
    selected.removeAttribute('style')
    const selector = propsRef.current.selector
    setOverrides((prev) => { const next = prev.filter((o) => o.selector !== selector); applyStylesheet(next); return next })
    setSelected(null)
  }, [selected, pushHistory, applyStylesheet])

  // ── Drag — uses transform:translate so nothing else in the layout shifts ────
  const startDrag = useCallback((e: React.MouseEvent) => {
    if (!selected) return
    e.preventDefault()
    pushHistory()
    didPushForFocus.current = true

    const [baseX, baseY] = parseTranslate(selected.style.getPropertyValue('transform'))
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX, baseY }
    setDragging(true)

    const onMove = (ev: MouseEvent) => {
      if (!selected || !dragRef.current) return
      const dx = dragRef.current.baseX + ev.clientX - dragRef.current.startX
      const dy = dragRef.current.baseY + ev.clientY - dragRef.current.startY
      selected.style.setProperty('transform', `translate(${dx}px, ${dy}px)`, 'important')
      setElRect(selected.getBoundingClientRect())
    }
    const onUp = (ev: MouseEvent) => {
      setDragging(false)
      dragRef.current = null
      if (selected) {
        const dx = baseX + ev.clientX - e.clientX
        const dy = baseY + ev.clientY - e.clientY
        const tf = `translate(${dx}px, ${dy}px)`
        setProps((prev) => ({ ...prev, transform: tf }))
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [selected, pushHistory])

  // ── body offset when panel is open ────────────────────────────────────────
  useEffect(() => {
    if (editMode && selected) document.body.classList.add('vse-active')
    else document.body.classList.remove('vse-active')
    return () => document.body.classList.remove('vse-active')
  }, [editMode, selected])

  const toggleEdit = () => {
    if (editMode) { setEditMode(false); setSelected(null); setHovered(null) }
    else setEditMode(true)
  }

  if (!isAdmin) return null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toggle */}
      <button data-vse className={`vse-toggle${editMode ? ' active' : ''}`} onClick={toggleEdit}>
        {editMode ? '✕ Exit' : '✏ Edit'}
      </button>

      {/* Drag grip — floats directly on the selected element */}
      {editMode && selected && elRect && (
        <div
          data-vse
          className={`vse-grip${dragging ? ' dragging' : ''}`}
          style={{ top: elRect.top, left: elRect.left }}
          onMouseDown={startDrag}
          title="Drag to move"
        >
          ⊹
        </div>
      )}

      {/* Inspector panel */}
      {editMode && selected && (
        <div data-vse className="vse-panel">
          <div className="vse-selector" title={props.selector}>
            <span className="vse-selector-label">Element</span>
            <code className="vse-selector-val">{props.selector?.split(' > ').pop()}</code>
          </div>

          <div className="vse-tabs">
            {(['type','space','pos'] as const).map((t) => (
              <button key={t} className={`vse-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
                {t==='type'?'Type':t==='space'?'Space':'Pos'}
              </button>
            ))}
          </div>

          <div className="vse-fields">
            {tab === 'type' && <>
              <VseRow label="Size"><VseNumInput value={props['font-size']} onChange={(v) => setProp('font-size',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Family"><input className="vse-input" value={props['font-family']??''} onChange={(e)=>setProp('font-family',e.target.value)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Weight">
                <select className="vse-select" value={props['font-weight']??''} onChange={(e)=>setProp('font-weight',e.target.value)} onFocus={onInputFocus}>
                  {['100','200','300','400','500','600','700','800','900'].map((w)=><option key={w}>{w}</option>)}
                </select>
              </VseRow>
              <VseRow label="Color"><VseColorInput value={props['color']??''} onChange={(v)=>setProp('color',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Bg"><VseColorInput value={props['background-color']??''} onChange={(v)=>setProp('background-color',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Align">
                <div className="vse-align-row">
                  {['left','center','right'].map((a)=>(
                    <button key={a} className={`vse-align-btn${props['text-align']===a?' active':''}`} onClick={()=>{pushHistory();setProp('text-align',a)}}>{a[0].toUpperCase()}</button>
                  ))}
                </div>
              </VseRow>
              <VseRow label="L-Spc"><VseNumInput value={props['letter-spacing']} onChange={(v)=>setProp('letter-spacing',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="L-Hgt"><VseNumInput value={props['line-height']} onChange={(v)=>setProp('line-height',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Opacity"><VseNumInput value={props['opacity']} onChange={(v)=>setProp('opacity',v)} defaultUnit="" onFocus={onInputFocus} /></VseRow>
            </>}

            {tab === 'space' && <>
              <div className="vse-box-label">Margin</div>
              <div className="vse-box4">
                {(['margin-top','margin-right','margin-bottom','margin-left'] as const).map((k)=>(
                  <VseBox4Input key={k} label={k.replace('margin-','')} value={props[k]??''} onChange={(v)=>setProp(k,v)} onFocus={onInputFocus} />
                ))}
              </div>
              <div className="vse-box-label">Padding</div>
              <div className="vse-box4">
                {(['padding-top','padding-right','padding-bottom','padding-left'] as const).map((k)=>(
                  <VseBox4Input key={k} label={k.replace('padding-','')} value={props[k]??''} onChange={(v)=>setProp(k,v)} onFocus={onInputFocus} />
                ))}
              </div>
              <VseRow label="Width"><VseNumInput value={props['width']} onChange={(v)=>setProp('width',v)} onFocus={onInputFocus} /></VseRow>
              <VseRow label="Height"><VseNumInput value={props['height']} onChange={(v)=>setProp('height',v)} onFocus={onInputFocus} /></VseRow>
            </>}

            {tab === 'pos' && <>
              <div className="vse-drag-hint">Grab the <strong>⊹</strong> badge on the element to drag it. Nothing else will shift.</div>
              <VseRow label="Move X">
                <VseNumInput
                  value={`${parseTranslate(props['transform']??'')[0]}px`}
                  onChange={(v) => { const [,y]=parseTranslate(props['transform']??''); setProp('transform',`translate(${v},${y}px)`) }}
                  onFocus={onInputFocus}
                />
              </VseRow>
              <VseRow label="Move Y">
                <VseNumInput
                  value={`${parseTranslate(props['transform']??'')[1]}px`}
                  onChange={(v) => { const [x]=parseTranslate(props['transform']??''); setProp('transform',`translate(${x}px,${v})`) }}
                  onFocus={onInputFocus}
                />
              </VseRow>
            </>}
          </div>

          <div className="vse-actions">
            <button className="vse-btn-undo" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">↩</button>
            <button className="vse-btn-reset" onClick={resetSelected}>Reset</button>
            <button className="vse-btn-save" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Floating panel when no element selected — save or clear page overrides */}
      {editMode && !selected && (
        <div data-vse className="vse-float-bar">
          {overrides.length > 0 && (
            <>
              <span className="vse-float-info">{overrides.length} override{overrides.length !== 1 ? 's' : ''}</span>
              <button className="vse-btn-save" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save page'}
              </button>
              <button className="vse-btn-clear" onClick={clearPage}>Clear all</button>
            </>
          )}
          {overrides.length === 0 && (
            <span className="vse-float-info">Click any element to edit it</span>
          )}
        </div>
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VseRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="vse-row"><span className="vse-row-label">{label}</span><div className="vse-row-ctrl">{children}</div></div>
}

function VseNumInput({ value, onChange, onFocus, defaultUnit = 'px' }: {
  value: string; onChange: (v: string) => void; onFocus?: () => void; defaultUnit?: string
}) {
  const n = px(value||''); const u = value ? unit(value) : defaultUnit
  return (
    <div className="vse-num-wrap">
      <input className="vse-input vse-num" type="number" value={n}
        onChange={(e) => onChange(e.target.value + u)} onFocus={onFocus} />
      <select className="vse-unit" value={u} onChange={(e) => onChange((n||'0') + e.target.value)} onFocus={onFocus}>
        {['px','em','rem','%','vw','vh',''].map((un) => <option key={un} value={un}>{un||'—'}</option>)}
      </select>
    </div>
  )
}

function VseColorInput({ value, onChange, onFocus }: { value: string; onChange: (v: string) => void; onFocus?: () => void }) {
  const hex = value?.startsWith('#') ? value : (value ? rgbToHex(value) : '#000000')
  return (
    <div className="vse-color-wrap">
      <input type="color" className="vse-color-swatch" value={hex} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} />
      <input className="vse-input" value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder="#hex / rgba" />
    </div>
  )
}

function VseBox4Input({ label, value, onChange, onFocus }: { label: string; value: string; onChange: (v: string) => void; onFocus?: () => void }) {
  const n = px(value||''); const u = value ? unit(value) : 'px'
  return (
    <div className="vse-box4-item">
      <span className="vse-box4-lbl">{label}</span>
      <input className="vse-input vse-num" type="number" value={n} onChange={(e) => onChange(e.target.value + u)} onFocus={onFocus} />
    </div>
  )
}
