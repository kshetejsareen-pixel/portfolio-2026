'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LIFT, tx } from '@/lib/motionVariants'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import type { InfoCopy } from '@/lib/copyConfig'
import type { PortraitData } from '@/lib/getInfoData'

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

export function InfoPage({ initialCopy, initialPortrait }: { initialCopy?: InfoCopy; initialPortrait?: PortraitData | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [copy, setCopy] = useState<InfoCopy>(() => initialCopy ?? {})
  const [portrait, setPortrait] = useState<PortraitData | null>(() => initialPortrait ?? null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  const heroEyebrow = copy.heroEyebrow ?? 'Info · A working biography'
  const heroIntro = copy.heroIntro ?? 'Independent photographer working between New York and Bombay. Portraits, interiors, and the quiet objects in between.'
  const bioPara1  = copy.bioPara1  ?? 'There is a moment, just before the shutter fires, where everything either holds together or it doesn\'t. Light, space, texture, intention — all of it in the balance. Kshetej has spent the better part of a decade learning to trust that moment.'
  const bioPara2  = copy.bioPara2  ?? 'He didn\'t arrive here through a conventional path. He was studying to be a Chartered Accountant when he realised the numbers he cared about were the ones on a lens barrel. Self-taught from the ground up — through YouTube rabbit holes, late-night forums, and the generosity of seniors who took the time to show him what no classroom would — he built his eye the hard way. And the hard way, it turns out, was the right way.'
  const bioPara3  = copy.bioPara3  ?? 'Over seven years, his work has taken him across continents — Dubai, Oman, Angola, the Maldives, and across the length and breadth of India — shooting for some of the world\'s most discerning hospitality and luxury brands. Taj. The Leela. Six Senses. JW Marriott. Jumeirah. Tom Ford. His editorial work has appeared in Architectural Digest.'
  const bioPara4  = copy.bioPara4  ?? 'Today, Kshetej Sareen Studios operates out of Delhi and Bangalore, shooting on Fujifilm GFX medium format and Sony — systems chosen not for their prestige, but for what they do to light at the edges of a frame, and matched deliberately to what each job demands.'
  const bioPara5  = copy.bioPara5  ?? 'The studio specialises in architectural, residential, hospitality, and F&B photography, working with clients who understand that great imagery is not decoration. It is the first impression, the lasting one, and everything in between.'
  const bioPara6  = copy.bioPara6  ?? 'He is still learning. That part hasn\'t changed.'
  const heroCap   = copy.heroCap   ?? 'Self · Studio · 2026'
  const bioHeading      = copy.bioHeading      ?? 'Biography'
  const practiceHeading = copy.practiceHeading ?? 'Practice, categories of work'
  const practiceNote    = copy.practiceNote    ?? 'Selected frames live in the category index — Portraits, Culinary, Spaces, Objects, Motion.'
  const nowHeading      = copy.nowHeading      ?? 'Now, current'
  const clientsHeading  = copy.clientsHeading  ?? 'Selected clients, recent'
  const pressHeading    = copy.pressHeading    ?? 'Press & exhibitions, selected'
  const touchHeading    = copy.touchHeading    ?? 'Get in touch'
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
          <motion.div
            {...LIFT}
            animate={mounted ? LIFT.visible : LIFT.initial}
            transition={tx(0.1)}
            className="info-hero-photo-col"
          >
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
          </motion.div>

          <div className="info-hero-text-col">
            <motion.div {...LIFT} animate={mounted ? LIFT.visible : LIFT.initial} transition={tx(0.22)} className="info-hero-eyebrow ks-eyebrow">
              {heroEyebrow}
            </motion.div>
            <motion.h1 {...LIFT} animate={mounted ? LIFT.visible : LIFT.initial} transition={tx(0.38)} className="info-hero-name">
              Kshetej<br />
              <span className="info-hero-name-last">Sareen<span className="info-hero-dot">.</span></span>
            </motion.h1>
            <motion.p {...LIFT} animate={mounted ? LIFT.visible : LIFT.initial} transition={tx(0.56)} className="info-hero-intro">{heroIntro}</motion.p>
          </div>
        </section>

        {/* ── Biography ── */}
        <motion.section
          className="info-bio"
          initial={LIFT.initial}
          whileInView={LIFT.visible}
          viewport={{ once: true, amount: 0.15 }}
          transition={tx()}
        >
          <div className="info-bio-label ks-eyebrow">{bioHeading}</div>
          <div className="info-bio-body">
            <p className="info-bio-para">{bioPara1}</p>
            <p className="info-bio-para">{bioPara2}</p>
            {bioPara3 && <p className="info-bio-para">{bioPara3}</p>}
            {bioPara4 && <p className="info-bio-para">{bioPara4}</p>}
            {bioPara5 && <p className="info-bio-para">{bioPara5}</p>}
            {bioPara6 && <p className="info-bio-para">{bioPara6}</p>}
          </div>
        </motion.section>

        {/* ── Get in touch ── */}
        <motion.section
          className="info-touch"
          initial={LIFT.initial}
          whileInView={LIFT.visible}
          viewport={{ once: true, amount: 0.15 }}
          transition={tx()}
        >
          <h2 className="info-touch-heading">
            {touchHeading}<span className="info-touch-period">.</span>
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
        </motion.section>

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
