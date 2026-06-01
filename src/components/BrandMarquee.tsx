'use client'

// Update this list with real client/brand names
const BRANDS = [
  'Tom Ford',
  'RAVOH',
  'Architectural Digest',
  'Vogue India',
  'Paul John',
  'Toit Brewpub',
  'Bandra Brewing Co.',
  'Taj Hotels',
  'The Leela',
  'Godrej Design Lab',
]

const SEP = '·'

export function BrandMarquee() {
  const items = [...BRANDS, ...BRANDS] // duplicate for seamless loop

  return (
    <div className="brand-bar">
      <div className="brand-bar-label">Trusted by</div>
      <div className="brand-bar-divider" />
      <div className="brand-bar-track-wrap">
        <div className="brand-bar-track">
          {items.map((b, i) => (
            <span key={i} className="brand-bar-item">
              {b}
              <span className="brand-bar-sep">{SEP}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
