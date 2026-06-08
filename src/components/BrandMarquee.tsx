'use client'

const BRANDS = [
  'Tom Ford',
  'Brunello Cucinelli',
  'Berluti',
  'Brioni',
  'Ladurée',
  'The Leela Palaces, Hotels & Resorts',
  'Taj Hotels Palaces Resorts Safaris',
  'JW Marriott Hotels & Resorts',
  'Le Méridien',
  'Jumeirah Hotels & Resorts',
  'Crowne Plaza Hotels & Resorts',
  'InterContinental Hotels & Resorts',
  'Six Senses Hotels Resorts Spas',
  'Meliá Hotels & Resorts',
  'Fiyavalhu Resort Maldives',
  'Edge Creekside Hotel',
  "Jamie Oliver's",
  'MDH Spices',
  '93 Degrees Coffee Roasters',
  'RAVOH',
  'DLF',
  'Cushman & Wakefield',
  'Viacom18',
  'Sunny Leone',
  'Good Homes Magazine',
]

const SEP = '·'

export function BrandMarquee() {
  const items = [...BRANDS, ...BRANDS] // duplicate for seamless loop

  return (
    <div className="brand-bar">
      <div className="brand-bar-top">
        <div className="brand-bar-label">Trusted by</div>
      </div>
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
