export interface Frame {
  subj: string
  loc: string
  year: string
  gear: string
  image?: string
}

export interface Category {
  id: string
  n: string
  label: string
  tint: string
  frames: Frame[]
}

export const categories: Category[] = [
  {
    id: 'culinary',
    n: '01',
    label: 'Culinary',
    tint: '#2a1f17',
    frames: [
      { subj: 'Stone fruit, late summer', loc: 'Sant Yago, Mallorca', year: '2025', gear: 'Phase One · 80mm' },
      { subj: 'Brick Lane kitchen pass',  loc: 'London E1',           year: '2024', gear: 'Leica SL2-S · 35mm' },
      { subj: 'Persimmons, after rain',   loc: 'Kyoto',               year: '2024', gear: 'Hasselblad · 120mm' },
      { subj: "Chef's table · twelve",    loc: 'Copenhagen',          year: '2023', gear: 'Pentax 67' },
    ],
  },
  {
    id: 'spaces',
    n: '02',
    label: 'Spaces',
    tint: '#1a2226',
    frames: [
      { subj: 'Marble stair',         loc: 'Tribeca Loft',         year: '2025', gear: 'Cambo Wide · 38mm' },
      { subj: 'Atelier, north light', loc: 'Lisbon',               year: '2024', gear: 'Hasselblad · 50mm' },
      { subj: 'Concrete chapel',      loc: 'Tadao Ando, Naoshima', year: '2023', gear: 'Mamiya 7' },
    ],
  },
  {
    id: 'portraits',
    n: '03',
    label: 'Portraits',
    tint: '#1d1c1a',
    frames: [
      { subj: 'Eli',   loc: 'Brooklyn Studio',  year: '2025', gear: 'Hasselblad 500C/M · 80mm' },
      { subj: 'Mira',  loc: 'Bombay',           year: '2025', gear: 'Leica M6 · 50mm · Tri-X 400' },
      { subj: 'Jonas', loc: 'Catskills Porch',  year: '2024', gear: 'Pentax 67 · 105mm' },
      { subj: 'Sade',  loc: 'Studio · Vol. iv', year: '2024', gear: 'Mamiya RZ67 · 110mm' },
      { subj: 'Imran', loc: 'Mehrauli',         year: '2023', gear: 'Leica Q2' },
    ],
  },
  {
    id: 'objects',
    n: '04',
    label: 'Products',
    tint: '#24211a',
    frames: [
      { subj: 'Brass kettle, no. 4',   loc: 'Studio', year: '2025', gear: 'Phase One · 120mm macro' },
      { subj: 'Vessels, set of eight', loc: 'Studio', year: '2024', gear: 'Mamiya RZ67 · 140mm' },
      { subj: 'Linen, folded',         loc: 'Studio', year: '2024', gear: 'Hasselblad · 80mm' },
    ],
  },
  {
    id: 'motion',
    n: '05',
    label: 'Motion',
    tint: '#0f1418',
    frames: [
      { subj: 'Rain, 24fps', loc: 'Bombay Monsoon', year: '2024', gear: 'Arri Alexa Mini · 35mm' },
      { subj: 'Loop · 8mm', loc: 'Goa',            year: '2023', gear: 'Bolex H8' },
    ],
  },
]
