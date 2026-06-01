'use client'

const BRANDS = [
  'Tom Ford',
  'Brunello Cucinelli',
  'Berluti',
  'Brioni',
  'Ladurée',
  'Six Senses',
  'JW Marriott Hotels & Resorts',
  'The Taj Hotels',
  'Le Méridien',
  'Jumeirah',
  'Crowne Plaza',
  'Jamie Oliver\'s',
  'Meliá Hotels & Resorts',
  'MDH Spices',
  'RAVOH',
  'DLF Emporio',
  'Good Homes Magazine',
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
