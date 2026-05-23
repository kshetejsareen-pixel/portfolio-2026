'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'

const PRACTICE = [
  { label: 'Portraits', frames: 24 },
  { label: 'Culinary', frames: 38 },
  { label: 'Spaces', frames: 19 },
  { label: 'Objects', frames: 12 },
  { label: 'Motion', frames: 7 },
]

const NOW = [
  { label: 'Residency', value: 'Lower East Side Studio, NY' },
  { label: 'In progress', value: 'Bombay street portraits series' },
  { label: 'Available', value: 'For commission & editorial' },
  { label: 'Print sales', value: 'Open edition · on request' },
]

const CLIENTS = [
  { name: 'Apartamento', year: '2021–' },
  { name: 'Cereal Magazine', year: '2022–' },
  { name: 'Kinfolk', year: '2023–' },
  { name: 'The New York Times', year: '2024–' },
  { name: 'The Gentlewoman', year: '2024' },
  { name: 'Aēsop', year: '2023 / 2025' },
  { name: 'Le Labo', year: '2024' },
  { name: 'Hermès', year: '2025' },
]

const PRESS = [
  { name: 'Pier 24 Photography', year: '2025' },
  { name: 'Aperture Foundation', year: '2024' },
  { name: 'Foam Talent', year: '2024' },
  { name: 'British Journal of Photography', year: '2023' },
  { name: "It's Nice That", year: '2023' },
]

export function InfoPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
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

        {/* Hero — split */}
        <section className="info-hero">
          <div className="info-hero-photo-col">
            <div className="info-hero-photo">
              <div className="info-hero-photo-inner">
                <div className="info-photo-placeholder">
                  PORTRAIT · 4 : 5<br />Drop your image here
                </div>
              </div>
            </div>
            <div className="info-hero-photo-cap">
              <span className="ks-eyebrow">Self · Studio · 2026</span>
            </div>
          </div>

          <div className="info-hero-text-col">
            <div className="info-hero-eyebrow ks-eyebrow">
              <span className="ks-dot" />
              Info · A working biography
            </div>
            <h1 className="info-hero-name">
              Kshetej<br />
              <span className="info-hero-name-last">Sareen.</span>
            </h1>
            <p className="info-hero-intro">
              Independent photographer working between New York and Bombay.
              Portraits, interiors, and the quiet objects in between.
            </p>
          </div>
        </section>

        {/* Biography */}
        <section className="info-bio">
          <div className="info-bio-inner">
            <p className="info-bio-para">
              Born in New Delhi, raised across cities. Began making photographs
              seriously in 2018 after a decade spent between design studios and
              film sets. The discipline of both still informs the work — a
              restlessness with composition, a suspicion of the obvious frame.
            </p>
            <p className="info-bio-para">
              The practice spans editorial, commercial, and personal bodies of
              work. Formally trained in visual communication; largely self-taught
              in photography. Drawn to the space between documentation and
              fiction, the image that sits still long enough to become something
              else.
            </p>
            <p className="info-bio-para">
              Currently based in New York. Available for assignment worldwide.
            </p>
          </div>
        </section>

        {/* Four-section grid */}
        <section className="info-sections">
          <div className="info-rule" />

          <div className="info-grid">

            {/* 01 Practice */}
            <div className="info-section">
              <div className="info-section-header">
                <span className="info-section-n">01</span>
                <div>
                  <div className="info-section-title">Practice</div>
                  <div className="info-section-sub">categories of work</div>
                </div>
              </div>
              <ul className="info-practice-list">
                {PRACTICE.map((p) => (
                  <li key={p.label} className="info-practice-item">
                    <span className="info-practice-label">{p.label}</span>
                    <span className="info-practice-frames">{p.frames} frames</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 02 Now */}
            <div className="info-section">
              <div className="info-section-header">
                <span className="info-section-n">02</span>
                <div>
                  <div className="info-section-title">Now</div>
                  <div className="info-section-sub">current</div>
                </div>
              </div>
              <ul className="info-now-list">
                {NOW.map((item) => (
                  <li key={item.label} className="info-now-item">
                    <span className="info-now-label">{item.label}</span>
                    <span className="info-now-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 03 Clients */}
            <div className="info-section">
              <div className="info-section-header">
                <span className="info-section-n">03</span>
                <div>
                  <div className="info-section-title">Selected clients</div>
                  <div className="info-section-sub">recent</div>
                </div>
              </div>
              <ul className="info-clients-list">
                {CLIENTS.map((c) => (
                  <li key={c.name} className="info-client-item">
                    <span className="info-client-name">{c.name}</span>
                    <span className="info-client-year">{c.year}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 04 Press */}
            <div className="info-section">
              <div className="info-section-header">
                <span className="info-section-n">04</span>
                <div>
                  <div className="info-section-title">Press &amp; exhibitions</div>
                  <div className="info-section-sub">selected</div>
                </div>
              </div>
              <ul className="info-clients-list">
                {PRESS.map((p) => (
                  <li key={p.name} className="info-client-item">
                    <span className="info-client-name">{p.name}</span>
                    <span className="info-client-year">{p.year}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* Get in touch */}
        <section className="info-touch">
          <div className="info-touch-inner">
            <h2 className="info-touch-heading">
              Get in touch<span className="info-touch-dot">.</span>
            </h2>
            <div className="info-touch-grid">
              <div className="info-touch-col">
                <div className="info-touch-col-label">Studio</div>
                <a href="mailto:info@kshetejsareen.com" className="info-touch-email">
                  info@kshetejsareen.com
                </a>
                <div className="info-touch-note">For commissions &amp; prints</div>
              </div>
              <div className="info-touch-col">
                <div className="info-touch-col-label">By appointment</div>
                <div className="info-touch-addr">New York · Bombay</div>
                <div className="info-touch-note">Studio visits welcome</div>
              </div>
              <div className="info-touch-col">
                <div className="info-touch-col-label">Elsewhere</div>
                <div className="info-touch-social">
                  <a
                    href="https://instagram.com/kshetejsareen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-touch-social-link"
                  >
                    @kshetejsareen<span className="info-touch-platform">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="cat-footer">
        <div>© Kshetej Sareen · MMXXVI</div>
        <div className="cat-footer-center"><Link href="/">↑ Back to index</Link></div>
        <div className="cat-footer-right">info@kshetejsareen.com</div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
