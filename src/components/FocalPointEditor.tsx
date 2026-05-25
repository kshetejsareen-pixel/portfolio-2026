'use client'

import { useState, useRef, useCallback } from 'react'

interface CropRect {
  left: number   // 0–1 fraction of image width
  top: number
  width: number
  height: number
}

// Compute the CSS object-fit:cover crop rect (as image fractions) for a given display AR and focal point.
function computeCropRect(imageAR: number, displayAR: number, fx: number, fy: number): CropRect {
  if (imageAR > displayAR) {
    // Image wider than display → overflow on sides, no vertical overflow
    const cropW = displayAR / imageAR
    return { left: (1 - cropW) * fx, top: 0, width: cropW, height: 1 }
  } else {
    // Image taller than display → overflow top/bottom, no horizontal overflow
    const cropH = imageAR / displayAR
    return { left: 0, top: (1 - cropH) * fy, width: 1, height: cropH }
  }
}

function CropOverlay({ label, color, imageAR, displayAR, focalX, focalY }: {
  label: string
  color: string
  imageAR: number
  displayAR: number
  focalX: number
  focalY: number
}) {
  const rect = computeCropRect(imageAR, displayAR, focalX / 100, focalY / 100)
  const l = rect.left * 100
  const t = rect.top * 100
  const w = rect.width * 100
  const h = rect.height * 100
  const r = 100 - l - w
  const b = 100 - t - h

  return (
    <div className="adm-focal-overlay" aria-hidden="true">
      {t > 0  && <div className="adm-focal-dim" style={{ top: 0, left: 0, right: 0, height: `${t}%` }} />}
      {b > 0  && <div className="adm-focal-dim" style={{ bottom: 0, left: 0, right: 0, height: `${b}%` }} />}
      {l > 0  && <div className="adm-focal-dim" style={{ top: `${t}%`, left: 0, width: `${l}%`, height: `${h}%` }} />}
      {r > 0  && <div className="adm-focal-dim" style={{ top: `${t}%`, right: 0, width: `${r}%`, height: `${h}%` }} />}
      <div className="adm-focal-crop-border" style={{
        left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`,
        borderColor: color,
      }}>
        <span className="adm-focal-crop-label" style={{ background: color }}>{label}</span>
      </div>
    </div>
  )
}

export function FocalPointEditor({ imageUrl, slotId, initialX = 50, initialY = 50, onSave, onCancel }: {
  imageUrl: string
  slotId: string
  initialX?: number
  initialY?: number
  onSave: (focalX: number, focalY: number) => Promise<void>
  onCancel: () => void
}) {
  const [focal, setFocal]   = useState({ x: initialX, y: initialY })
  const [imageAR, setImageAR] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClient = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
    setFocal({ x, y })
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    updateFromClient(e.clientX, e.clientY)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging.current) updateFromClient(e.clientX, e.clientY)
  }
  const onMouseUp = () => { dragging.current = false }

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    updateFromClient(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    e.preventDefault()
    updateFromClient(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchEnd = () => { dragging.current = false }

  const handleSave = async () => {
    setSaving(true)
    await onSave(Math.round(focal.x), Math.round(focal.y))
    setSaving(false)
  }

  return (
    <aside className="adm-library adm-focal-editor">
      <div className="adm-library-head">
        <div className="adm-library-title">Set focal point</div>
        <div className="adm-focal-subtitle">
          Click or drag to set focus. Blue = desktop 16:9, amber = mobile 9:19.5.
        </div>
      </div>

      <div
        ref={containerRef}
        className="adm-focal-canvas"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="adm-focal-img"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget
            setImageAR(img.naturalWidth / img.naturalHeight)
          }}
        />

        {imageAR && (
          <>
            <CropOverlay
              label="Desktop 16:9"
              color="#4a9eff"
              imageAR={imageAR}
              displayAR={16 / 9}
              focalX={focal.x}
              focalY={focal.y}
            />
            <CropOverlay
              label="Mobile 9:19.5"
              color="#f5a623"
              imageAR={imageAR}
              displayAR={9 / 19.5}
              focalX={focal.x}
              focalY={focal.y}
            />
          </>
        )}

        <div className="adm-focal-dot" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
      </div>

      <div className="adm-focal-coords">
        {slotId} · focus {Math.round(focal.x)}% · {Math.round(focal.y)}%
      </div>

      <div className="adm-copy-actions">
        <button className="adm-copy-cancel" onClick={onCancel}>Cancel</button>
        <button className="adm-copy-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save focal point →'}
        </button>
      </div>
    </aside>
  )
}
