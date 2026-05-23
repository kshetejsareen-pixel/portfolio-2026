export interface Frame {
  title: string
  location: string
  year: string
  camera: string
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
      { title: 'Stone fruit, late summer', location: 'Sant Yago, Mallorca', year: '2025', camera: 'Phase One · 80mm' },
      { title: 'Brick Lane kitchen pass',  location: 'London E1',           year: '2024', camera: 'Leica SL2-S · 35mm' },
      { title: 'Persimmons, after rain',   location: 'Kyoto',               year: '2024', camera: 'Hasselblad · 120mm' },
      { title: "Chef's table · twelve",    location: 'Copenhagen',          year: '2023', camera: 'Pentax 67' },
    ],
  },
  {
    id: 'spaces',
    n: '02',
    label: 'Spaces',
    tint: '#1a2226',
    frames: [
      { title: 'Marble stair',         location: 'Tribeca Loft',         year: '2025', camera: 'Cambo Wide · 38mm' },
      { title: 'Atelier, north light', location: 'Lisbon',               year: '2024', camera: 'Hasselblad · 50mm' },
      { title: 'Concrete chapel',      location: 'Tadao Ando, Naoshima', year: '2023', camera: 'Mamiya 7' },
    ],
  },
  {
    id: 'portraits',
    n: '03',
    label: 'Portraits',
    tint: '#1d1c1a',
    frames: [
      { title: 'Eli',   location: 'Brooklyn Studio',  year: '2025', camera: 'Hasselblad 500C/M · 80mm' },
      { title: 'Mira',  location: 'Bombay',           year: '2025', camera: 'Leica M6 · 50mm · Tri-X 400' },
      { title: 'Jonas', location: 'Catskills Porch',  year: '2024', camera: 'Pentax 67 · 105mm' },
      { title: 'Sade',  location: 'Studio · Vol. iv', year: '2024', camera: 'Mamiya RZ67 · 110mm' },
      { title: 'Imran', location: 'Mehrauli',         year: '2023', camera: 'Leica Q2' },
    ],
  },
  {
    id: 'objects',
    n: '04',
    label: 'Objects',
    tint: '#24211a',
    frames: [
      { title: 'Brass kettle, no. 4',   location: 'Studio', year: '2025', camera: 'Phase One · 120mm macro' },
      { title: 'Vessels, set of eight', location: 'Studio', year: '2024', camera: 'Mamiya RZ67 · 140mm' },
      { title: 'Linen, folded',         location: 'Studio', year: '2024', camera: 'Hasselblad · 80mm' },
    ],
  },
  {
    id: 'motion',
    n: '05',
    label: 'Motion',
    tint: '#0f1418',
    frames: [
      { title: 'Rain, 24fps', location: 'Bombay Monsoon', year: '2024', camera: 'Arri Alexa Mini · 35mm' },
      { title: 'Loop · 8mm', location: 'Goa',            year: '2023', camera: 'Bolex H8' },
    ],
  },
]
