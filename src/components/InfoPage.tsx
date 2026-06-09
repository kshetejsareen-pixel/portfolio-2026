'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import type { InfoCopy } from '@/lib/copyConfig'

const DEFAULT_PRACTICE = [
  { label: 'Portraits', frames: 24 },
  { label: 'Culinary', frames: 38 },
  { label: 'Spaces', frames: 19 },
  { label: 'Objects', frames: 12 },
  { label: 'Motion', frames: 7 },
]

const DEFAULT_NOW = [
  'Residency — Kindred Studio, Brooklyn — through Aug 2026',
  'In progress — The Fruit Table, vol. ii (Kyoto)',
  'Available — Bookings · May–Sept 2026',
  'Print sales — Editions of 12 — by request',
]

const DEFAULT_CLIENTS = [
  { name: 'Apartamento', year: '2021—' },
  { name: 'Cereal Magazine', year: '2022—' },
  { name: 'Kinfolk', year: '2023—' },
  { name: 'The New York Times', year: '2024—' },
  { name: 'The Gentlewoman', year: '2024' },
  { name: 'Aēsop', year: '2023, 2025' },
  { name: 'Le Labo', year: '2024' },
  { name: 'Hermès', year: '2025' },
]

const DEFAULT_PRESS = [
  { name: 'Pier 24 — group show', year: '2025' },
  { name: 'Aperture, vol. 246', year: '2024' },
  { name: 'Foam Talent — finalist', year: '2024' },
  { name: 'British Journal of Photography', year: '2023' },
  { name: "It's Nice That · profile", year: '2023' },
]

function parseNameYear(text: string): { name: string; year: string }[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.lastIndexOf(' — ')
      if (idx === -1) return { name: l, year: '' }
      return { name: l.slice(0, idx), year: l.slice(idx + 3) }
    })
}

interface PortraitData { url: string; focalX?: number; focalY?: number }

export function InfoPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [copy, setCopy] = useState<InfoCopy>({})
  const [portrait, setPortrait] = useState<PortraitData | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/copy')
      .then((r) => r.json())
      .then((d) => { if (d.copy?.info) setCopy(d.copy.info as InfoCopy) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/info-portrait')
      .then((r) => r.json())
      .then((d) => { if (d.portrait) setPortrait(d.portrait) })
      .catch(() => {})
  }, [])

  const heroIntro = copy.heroIntro ?? 'Independent photographer working between New York and Bombay. Portraits, interiors, and the quiet objects in between.'
  const bioPara1  = copy.bioPara1  ?? 'Kshetej Sareen is a photographer whose work moves between studio portraits and the small, particular objects of everyday life — vessels, linens, fruit on a table, hands at work. Trained as an architect, his frames lean toward the still, the patient, the carefully lit.'
  const bioPara2  = copy.bioPara2  ?? 'He keeps two studios — one in Brooklyn, one in Bombay — and works on commission for editorial, hospitality, and book projects. Available worldwide and currently booking for 2026.'
  const heroCap   = copy.heroCap   ?? 'Self · Studio · 2026'
  const practiceNote = copy.practiceNote ?? 'Selected frames live in the category index — Portraits, Culinary, Spaces, Objects, Motion.'
  const touchEmail           = copy.touchEmail           ?? 'info@kshetejsareen.com'
  const touchEmailNote       = copy.touchEmailNote       ?? 'For commissions & prints'
  const touchAppointment     = copy.touchAppointment     ?? 'New York · Bombay'
  const touchAppointmentNote = copy.touchAppointmentNote ?? 'Studio visits welcome'
  const touchSocial          = copy.touchSocial          ?? '@kshetejsareen'
  const touchSocialNote      = copy.touchSocialNote      ?? 'Instagram'

  const practiceItems = copy.practiceItems
    ? copy.practiceItems.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const idx = l.lastIndexOf(' — ')
        if (idx === -1) return { label: l, frames: 0 }
        return { label: l.slice(0, idx), frames: parseInt(l.slice(idx + 3), 10) || 0 }
      })
    : DEFAULT_PRACTICE

  const nowItems = copy.nowItems
    ? copy.nowItems.split('\n').map((l) => l.trim()).filter(Boolean)
    : DEFAULT_NOW

  const clients = copy.clients
    ? parseNameYear(copy.clients)
    : DEFAULT_CLIENTS

  const press = copy.press
    ? parseNameYear(copy.press)
    : DEFAULT_PRESS

  return (
    <div className="ks-page-root">
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks" aria-label="Back to home">KS</Link>
          <div className="cat-tb-crumb">
            <Link href="/">Index</Link>
            <span>/</span>
            <span className="cat-tb-cur">Info</span>
          </div>
        </div>
        <div className="cat-tb-right info-tb-right">
          <Link href="/info" className="info-tb-link info-tb-link--active">Info</Link>
          <Link href="/contact" className="info-tb-link">Contact</Link>
          <button onClick={() => setMenuOpen(true)} className="info-tb-menu">Menu +</button>
        </div>
      </header>

      <main className="info-main">

        {/* ── Hero ── */}
        <section className="info-hero">
          <div className="info-hero-photo-col">
            <div className="info-hero-photo-wrap">
              {portrait ? (
                <div className="info-hero-photo-inner info-hero-photo-inner--filled">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portrait.url}
                    alt="Kshetej Sareen"
                    className="info-hero-img"
                    style={{
                      objectPosition: portrait.focalX != null && portrait.focalY != null
                        ? `${portrait.focalX}% ${portrait.focalY}%`
                        : 'center top',
                    }}
                  />
                </div>
              ) : (
                <div className="info-hero-photo-inner">
                  <div className="info-photo-slot-label">Portrait · 4 : 5</div>
                  <div className="info-photo-slot-cta">Assign image in admin</div>
                </div>
              )}
            </div>
            <div className="info-hero-cap ks-eyebrow">{heroCap}</div>
          </div>

          <div className="info-hero-text-col">
            <div className="info-hero-eyebrow ks-eyebrow">
              Info · A working biography
            </div>
            <h1 className="info-hero-name">
              Kshetej<br />
              <span className="info-hero-name-last">Sareen<span className="info-hero-dot">.</span></span>
            </h1>
            <p className="info-hero-intro">{heroIntro}</p>
          </div>
        </section>

        {/* ── Biography ── */}
        <section className="info-bio" data-sr>
          <div className="info-bio-label ks-eyebrow">Biography</div>
          <div className="info-bio-body">
            <p className="info-bio-para">{bioPara1}</p>
            <p className="info-bio-para">{bioPara2}</p>
          </div>
        </section>

        {/* ── Four sections ── */}
        <section className="info-sections" data-sr>
          <div className="info-sections-rule" />

          <div className="info-quad">

            {/* 01 Practice */}
            <div className="info-quad-cell">
              <div className="info-quad-head">
                <span className="info-quad-n">01</span>
                <h2 className="info-quad-title">
                  Practice, <em>categories of work</em>
                </h2>
              </div>
              <div className="info-quad-rule" />
              <ul className="info-practice-list">
                {practiceItems.map((p) => (
                  <li key={p.label} className="info-practice-item">
                    <span className="info-practice-label">{p.label}</span>
                    <span className="info-practice-frames">{p.frames}&thinsp;frames</span>
                  </li>
                ))}
              </ul>
              <p className="info-practice-note">{practiceNote}</p>
            </div>

            {/* 02 Now */}
            <div className="info-quad-cell">
              <div className="info-quad-head">
                <span className="info-quad-n">02</span>
                <h2 className="info-quad-title">
                  Now, <em>current</em>
                </h2>
              </div>
              <div className="info-quad-rule" />
              <ul className="info-now-list">
                {nowItems.map((item, i) => (
                  <li key={i} className="info-now-item">{item}</li>
                ))}
              </ul>
            </div>

            {/* 03 Clients */}
            <div className="info-quad-cell">
              <div className="info-quad-head">
                <span className="info-quad-n">03</span>
                <h2 className="info-quad-title">
                  Selected clients, <em>recent</em>
                </h2>
              </div>
              <div className="info-quad-rule" />
              <ul className="info-clients-list">
                {clients.map((c) => (
                  <li key={c.name} className="info-client-item">
                    <span className="info-client-name">{c.name}</span>
                    <span className="info-client-year">{c.year}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 04 Press */}
            <div className="info-quad-cell">
              <div className="info-quad-head">
                <span className="info-quad-n">04</span>
                <h2 className="info-quad-title">
                  Press &amp; exhibitions, <em>selected</em>
                </h2>
              </div>
              <div className="info-quad-rule" />
              <ul className="info-clients-list">
                {press.map((p) => (
                  <li key={p.name} className="info-client-item">
                    <span className="info-client-name">{p.name}</span>
                    <span className="info-client-year">{p.year}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ── Get in touch ── */}
        <section className="info-touch" data-sr>
          <div className="info-touch-rule" />
          <h2 className="info-touch-heading">
            Get in touch<span className="info-touch-period">.</span>
          </h2>
          <div className="info-touch-cols">
            <div className="info-touch-col">
              <div className="info-touch-col-label">Studio</div>
              <a href={`mailto:${touchEmail}`} className="info-touch-val">
                {touchEmail}
              </a>
              <div className="info-touch-sub">{touchEmailNote}</div>
            </div>
            <div className="info-touch-col">
              <div className="info-touch-col-label">By appointment</div>
              <div className="info-touch-val">{touchAppointment}</div>
              <div className="info-touch-sub">{touchAppointmentNote}</div>
            </div>
            <div className="info-touch-col">
              <div className="info-touch-col-label">Elsewhere</div>
              <a
                href={`https://instagram.com/${touchSocial.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-touch-val"
              >
                {touchSocial}
              </a>
              <div className="info-touch-sub">{touchSocialNote}</div>
            </div>
          </div>
        </section>

      </main>

      <footer className="cat-footer">
        <div className="cat-footer-copy">
          <div>© Kshetej Sareen · 2026</div>
          <div>info@kshetejsareen.com</div>
        </div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
