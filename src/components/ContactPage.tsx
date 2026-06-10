'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'
import type { ContactCopy } from '@/lib/copyConfig'

const PROJECT_TYPES = ['Culinary', 'Spaces', 'Portraits', 'Objects', 'Motion']
const TIMELINES = ['This month', '1–3 months', '3+ months', 'Open / flexible']
const BUDGETS = ['Under $5k', '$5k–$15k', '$15k–$50k', '$50k+', 'Print only']

const DIRECT = [
  {
    label: 'Studio',
    value: 'info@kshetejsareen.com',
    href: 'mailto:info@kshetejsareen.com',
    note: 'For commissions & prints',
  },
  {
    label: 'WhatsApp',
    value: '+91 99995 67676',
    href: 'https://wa.me/919999567676',
    note: 'Fastest response',
  },
  {
    label: 'New York',
    value: 'Brooklyn, NY',
    href: null,
    note: 'By appointment · Mon–Fri',
  },
  {
    label: 'Bombay',
    value: 'Bandra W, Mumbai',
    href: null,
    note: 'By appointment',
  },
  {
    label: 'Elsewhere',
    value: '@kshetejsareen',
    href: 'https://instagram.com/kshetejsareen',
    note: 'Instagram',
  },
  {
    label: 'Press',
    value: 'info@kshetejsareen.com',
    href: 'mailto:info@kshetejsareen.com',
    note: 'Media inquiries, image use',
  },
]

const NOTES = [
  {
    label: 'Lead time',
    value: 'Commissions typically book 3–6 weeks out. Print orders ship within 10 working days.',
    label2: 'Day rates',
    value2: 'Available on request once project scope is clear. Half-day, full-day, and multi-day rates.',
  },
  {
    label: 'Travel',
    value: 'Comfortable working internationally. Travel costs billed at actuals; no day-rate uplift.',
    label2: 'Usage & licensing',
    value2: 'All commissions include a 12-month editorial usage by default. Extended usage and exclusivity quoted separately.',
  },
  {
    label: 'Image use & press',
    value: 'Press kit and high-res files available on request from info@kshetejsareen.com.',
    label2: 'Prints',
    value2: 'Editions of 12, printed in studio on Hahnemühle Photo Rag. Signed, numbered, and stamped on verso.',
  },
]

function parseNotesCol(text: string): { label: string; value: string }[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const idx = l.indexOf(' — ')
    if (idx === -1) return { label: l, value: '' }
    return { label: l.slice(0, idx), value: l.slice(idx + 3) }
  })
}

type Status = 'idle' | 'submitting' | 'sent' | 'error'

function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`contact-chip${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [contactCopy, setContactCopy] = useState<ContactCopy>({})

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/copy')
      .then((r) => r.json())
      .then((d) => { if (d.copy?.contact) setContactCopy(d.copy.contact as ContactCopy) })
      .catch(() => {})
  }, [])

  const tickerStatus    = contactCopy.tickerStatus    ?? 'Open for bookings — May through Sept 2026'
  const tickerLeadTime  = contactCopy.tickerLeadTime  ?? 'Lead time · 3–6 weeks'
  const heroTitle       = contactCopy.heroTitle       ?? 'Say hello'
  const heroPara1       = contactCopy.heroPara1       ?? null
  const heroPara2       = contactCopy.heroPara2       ?? null
  const inquiryEyebrow  = contactCopy.inquiryEyebrow  ?? '01 · Project inquiry'
  const inquiryHeading  = contactCopy.inquiryHeading  ?? 'Start with the project, not the form.'
  const inquiryNote     = contactCopy.inquiryNote     ?? "The chips are optional — fill the ones you know. Skip the rest. I'll figure it out from the message."
  const privacyText     = contactCopy.privacyText     ?? 'No mailing list. Your details stay between us.'
  const directTitle     = contactCopy.directTitle     ?? 'Direct channels.'
  const directDesc      = contactCopy.directDesc      ?? 'For returning collaborators, press inquiries, and walk-up questions — the fastest way is straight to the line.'

  const directChannels = contactCopy.directChannels
    ? contactCopy.directChannels.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const parts = l.split(' | ')
        return { label: parts[0] ?? '', value: parts[1] ?? '', note: parts[2] ?? '', href: parts[3] || null }
      })
    : DIRECT

  const notesEyebrow = contactCopy.notesEyebrow ?? '02 · Working notes'
  const leftNotes  = contactCopy.notesLeft  ? parseNotesCol(contactCopy.notesLeft)  : NOTES.map((n) => ({ label: n.label,  value: n.value  }))
  const rightNotes = contactCopy.notesRight ? parseNotesCol(contactCopy.notesRight) : NOTES.map((n) => ({ label: n.label2, value: n.value2 }))

  const toggleType = (t: string) =>
    setProjectTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, company,
          projectType: projectTypes.join(', '),
          timeline, budget, message,
        }),
      })
      if (res.ok) {
        setStatus('sent')
        setName(''); setEmail(''); setCompany('')
        setProjectTypes([]); setTimeline(''); setBudget(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="ks-page-root">
      {/* Topbar */}
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks" aria-label="Back to home">KS</Link>
          <div className="cat-tb-crumb">
            <Link href="/">Index</Link>
            <span>/</span>
            <span className="cat-tb-cur">Contact</span>
          </div>
        </div>
        <div className="cat-tb-right info-tb-right">
          <Link href="/info" className="info-tb-link">Info</Link>
          <Link href="/contact" className="info-tb-link info-tb-link--active">Contact</Link>
          <button onClick={() => setMenuOpen(true)} className="info-tb-menu">Menu +</button>
        </div>
      </header>

      {/* Availability ticker */}
      <div className="contact-ticker">
        <span className="contact-ticker-left">
          <span className="contact-ticker-dot" />
          {tickerStatus}
        </span>
        <span className="contact-ticker-right">{tickerLeadTime}</span>
      </div>

      <main className="contact-main-v2">

        {/* ── Hero ── */}
        <section className="contact-hero-v2">
          <div className="contact-hero-eyebrow ks-eyebrow">Contact</div>
          <h1 className="contact-hero-title">
            {heroTitle}<span className="contact-hero-period">.</span>
          </h1>
          <div className="contact-hero-cols">
            <p className="contact-hero-col">
              {heroPara1 ?? <>For commissions, prints, and press — <em>the form is the fastest route.</em>{' '}Tell me a little about the project and I&rsquo;ll write back within two working days.</>}
            </p>
            <p className="contact-hero-col">
              {heroPara2 ?? <>Returning collaborators and editors, you have the studio direct line below. Working between New York and Bombay, expect a thoughtful (slightly slow) reply.</>}
            </p>
          </div>
        </section>

        <div className="contact-divider" />

        {/* ── Form ── */}
        <section className="contact-inquiry" data-sr>
          <div className="contact-inquiry-left">
            <div className="contact-inquiry-label ks-eyebrow">{inquiryEyebrow}</div>
            <h2 className="contact-inquiry-heading">{inquiryHeading}</h2>
            <p className="contact-inquiry-note">{inquiryNote}</p>
          </div>

          {status === 'sent' ? (
            <div className="contact-sent-v2">
              <div className="contact-sent-mark">✓</div>
              <p>Message received. I&rsquo;ll be in touch within 48 hours.</p>
              <button className="contact-sent-reset" onClick={() => setStatus('idle')}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form-v2" onSubmit={handleSubmit} noValidate>

              {/* Name + Email */}
              <div className="contact-row-2">
                <div className="contact-field-v2">
                  <label className="contact-field-label">Your name</label>
                  <input
                    className="contact-input-v2"
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>
                <div className="contact-field-v2">
                  <label className="contact-field-label">Email</label>
                  <input
                    className="contact-input-v2"
                    type="email"
                    placeholder="you@studio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>

              {/* Company */}
              <div className="contact-field-v2">
                <label className="contact-field-label">
                  Company or publication <span className="contact-optional">(optional)</span>
                </label>
                <input
                  className="contact-input-v2"
                  type="text"
                  placeholder="Magazine, agency, brand"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={status === 'submitting'}
                />
              </div>

              {/* Project type chips */}
              <div className="contact-field-v2">
                <label className="contact-field-label">Project type</label>
                <div className="contact-chips">
                  {PROJECT_TYPES.map((t) => (
                    <Chip key={t} label={t} selected={projectTypes.includes(t)} onClick={() => toggleType(t)} />
                  ))}
                </div>
              </div>

              {/* Timeline + Budget */}
              <div className="contact-row-2">
                <div className="contact-field-v2">
                  <label className="contact-field-label">Timeline</label>
                  <div className="contact-chips">
                    {TIMELINES.map((t) => (
                      <Chip key={t} label={t} selected={timeline === t} onClick={() => setTimeline(timeline === t ? '' : t)} />
                    ))}
                  </div>
                </div>
                <div className="contact-field-v2">
                  <label className="contact-field-label">Budget range</label>
                  <div className="contact-chips">
                    {BUDGETS.map((b) => (
                      <Chip key={b} label={b} selected={budget === b} onClick={() => setBudget(budget === b ? '' : b)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="contact-field-v2">
                <label className="contact-field-label">Tell me about the project</label>
                <textarea
                  className="contact-input-v2 contact-textarea-v2"
                  placeholder="A few sentences is plenty — concept, dates, location, anything else useful."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={status === 'submitting'}
                />
              </div>

              {status === 'error' && (
                <p className="contact-error-v2">Something went wrong — please email directly.</p>
              )}

              {/* Submit row */}
              <div className="contact-submit-row">
                <span className="contact-privacy">{privacyText}</span>
                <button
                  className="contact-submit-v2"
                  type="submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending…' : 'Send inquiry →'}
                </button>
              </div>

            </form>
          )}
        </section>

        <div className="contact-divider" />

        {/* ── Direct channels ── */}
        <section className="contact-direct-v2">
          <div className="contact-direct-head">
            <h2 className="contact-direct-title">
              {directTitle}
            </h2>
            <p className="contact-direct-desc">{directDesc}</p>
          </div>
          <div className="contact-direct-grid">
            {directChannels.map((d) => (
              <div key={d.label} className="contact-direct-cell">
                <div className="contact-direct-cell-label ks-eyebrow">{d.label}</div>
                {d.href ? (
                  <a
                    href={d.href}
                    className="contact-direct-cell-value"
                    target={d.href.startsWith('http') ? '_blank' : undefined}
                    rel={d.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {d.value}
                  </a>
                ) : (
                  <div className="contact-direct-cell-value">{d.value}</div>
                )}
                <div className="contact-direct-cell-note ks-eyebrow">{d.note}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="contact-divider" />

        {/* ── Working notes ── */}
        <section className="contact-notes" data-sr>
          <div className="contact-notes-label ks-eyebrow">{notesEyebrow}</div>
          <div className="contact-notes-table">
            {leftNotes.map((left, i) => {
              const right = rightNotes[i]
              return (
                <div key={i} className="contact-notes-row">
                  <div className="contact-notes-cell">
                    <div className="contact-notes-key ks-eyebrow">{left.label}</div>
                    <div className="contact-notes-val">{left.value}</div>
                  </div>
                  <div className="contact-notes-cell contact-notes-cell--right">
                    <div className="contact-notes-key ks-eyebrow">{right?.label}</div>
                    <div className="contact-notes-val">{right?.value}</div>
                  </div>
                </div>
              )
            })}
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
