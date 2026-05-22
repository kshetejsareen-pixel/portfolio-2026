'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KsMenuOverlay } from '@/components/KsMenuOverlay'

// Update this to your WhatsApp number (include country code, no + or spaces)
const WHATSAPP_NUMBER = '919999567676'

const PROJECT_TYPES = [
  'Editorial',
  'Culinary',
  'Spaces & Architecture',
  'Portraits',
  'Motion & Film',
  'Commercial',
  'Other',
]

type Status = 'idle' | 'submitting' | 'sent' | 'error'

export function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [projectType, setProjectType] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, projectType, message }),
      })
      if (res.ok) {
        setStatus('sent')
        setName(''); setEmail(''); setProjectType(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Top bar */}
      <header className={`cat-topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="cat-tb-left">
          <Link href="/" className="cat-tb-ks">KS</Link>
          <div className="cat-tb-crumb">
            <Link href="/">Index</Link>
            <span>/</span>
            <span className="cat-tb-cur">Contact</span>
          </div>
        </div>
        <div className="cat-tb-right">
          <button onClick={() => setMenuOpen(true)}>Menu +</button>
        </div>
      </header>

      <main className="contact-main">

        {/* Hero */}
        <section className="contact-hero">
          <div className="contact-hero-eyebrow">
            <span className="ks-dot" />
            <span className="ks-eyebrow">Get in touch</span>
          </div>
          <h1 className="contact-headline">
            Let&rsquo;s make<br />
            <span className="contact-headline-em">something.</span>
          </h1>
          <p className="contact-subline">
            Available for editorial, culinary, spaces, portraits &amp; motion.
            Based in New York and Bombay — working worldwide.
          </p>
        </section>

        {/* Body — form + direct contacts */}
        <section className="contact-body">

          {/* Form */}
          <div className="contact-form-col">
            <div className="contact-col-label">Send an enquiry</div>

            {status === 'sent' ? (
              <div className="contact-sent">
                <div className="contact-sent-mark">✓</div>
                <p>Message received. I&rsquo;ll be in touch within 48 hours.</p>
                <button className="contact-sent-reset" onClick={() => setStatus('idle')}>
                  Send another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-name">Name</label>
                  <input
                    id="cf-name"
                    className="contact-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-email">Email</label>
                  <input
                    id="cf-email"
                    className="contact-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-type">Project type</label>
                  <select
                    id="cf-type"
                    className="contact-input contact-select"
                    value={projectType}
                    onChange={e => setProjectType(e.target.value)}
                    disabled={status === 'submitting'}
                  >
                    <option value="">Select a category</option>
                    {PROJECT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-msg">Message</label>
                  <textarea
                    id="cf-msg"
                    className="contact-input contact-textarea"
                    placeholder="Tell me about the project — brief, timeline, any references."
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>

                {status === 'error' && (
                  <p className="contact-error">Something went wrong — please try emailing directly.</p>
                )}

                <button
                  className="contact-submit"
                  type="submit"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending…' : 'Send enquiry ↗'}
                </button>
              </form>
            )}
          </div>

          {/* Direct contacts */}
          <div className="contact-direct-col">
            <div className="contact-col-label">Direct</div>

            <a
              className="contact-direct-link"
              href="mailto:info@kshetejsareen.com"
            >
              <span className="contact-direct-label">Email</span>
              <span className="contact-direct-value">info@kshetejsareen.com</span>
              <span className="contact-direct-arrow">↗</span>
            </a>

            <a
              className="contact-direct-link"
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-direct-label">WhatsApp</span>
              <span className="contact-direct-value">+{WHATSAPP_NUMBER}</span>
              <span className="contact-direct-arrow">↗</span>
            </a>

            <div className="contact-note">
              Replies within 48 hours.<br />
              For urgent enquiries, WhatsApp is fastest.
            </div>
          </div>

        </section>

        {/* Studio strip */}
        <section className="contact-studio">
          <div className="contact-studio-item">
            <div className="contact-studio-label">Studio</div>
            <div className="contact-studio-value">New York · Bombay</div>
          </div>
          <div className="contact-studio-item">
            <div className="contact-studio-label">Availability</div>
            <div className="contact-studio-value">Worldwide · 2025–2026</div>
          </div>
          <div className="contact-studio-item">
            <div className="contact-studio-label">Visits</div>
            <div className="contact-studio-value">By appointment</div>
          </div>
          <div className="contact-studio-item">
            <div className="contact-studio-label">Press</div>
            <div className="contact-studio-value">
              <a href="mailto:info@kshetejsareen.com">info@kshetejsareen.com</a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="cat-footer">
        <div>© Kshetej Sareen · MMXXVI</div>
        <div className="cat-footer-center">
          <Link href="/">↑ Back to index</Link>
        </div>
        <div className="cat-footer-right">info@kshetejsareen.com</div>
      </footer>

      <KsMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
