export interface Slot {
  id: string
  page: string
  label: string
  hint: string   // aspect ratio / size hint
}

// Landing page — one slot per frame per category
const LANDING_SLOTS: Slot[] = [
  { id: 'landing-culinary-0',  page: 'Landing',   label: 'Culinary · Stone fruit, late summer',  hint: 'Full bleed · any ratio' },
  { id: 'landing-culinary-1',  page: 'Landing',   label: 'Culinary · Brick Lane kitchen pass',   hint: 'Full bleed · any ratio' },
  { id: 'landing-culinary-2',  page: 'Landing',   label: 'Culinary · Persimmons, after rain',    hint: 'Full bleed · any ratio' },
  { id: 'landing-culinary-3',  page: 'Landing',   label: "Culinary · Chef's table · twelve",     hint: 'Full bleed · any ratio' },
  { id: 'landing-spaces-0',    page: 'Landing',   label: 'Spaces · Marble stair',                hint: 'Full bleed · any ratio' },
  { id: 'landing-spaces-1',    page: 'Landing',   label: 'Spaces · Atelier, north light',        hint: 'Full bleed · any ratio' },
  { id: 'landing-spaces-2',    page: 'Landing',   label: 'Spaces · Concrete chapel',             hint: 'Full bleed · any ratio' },
  { id: 'landing-portraits-0', page: 'Landing',   label: 'Portraits · Eli',                      hint: 'Full bleed · any ratio' },
  { id: 'landing-portraits-1', page: 'Landing',   label: 'Portraits · Mira',                     hint: 'Full bleed · any ratio' },
  { id: 'landing-portraits-2', page: 'Landing',   label: 'Portraits · Jonas',                    hint: 'Full bleed · any ratio' },
  { id: 'landing-portraits-3', page: 'Landing',   label: 'Portraits · Sade',                     hint: 'Full bleed · any ratio' },
  { id: 'landing-portraits-4', page: 'Landing',   label: 'Portraits · Imran',                    hint: 'Full bleed · any ratio' },
  { id: 'landing-objects-0',   page: 'Landing',   label: 'Objects · Brass kettle, no. 4',        hint: 'Full bleed · any ratio' },
  { id: 'landing-objects-1',   page: 'Landing',   label: 'Objects · Vessels, set of eight',      hint: 'Full bleed · any ratio' },
  { id: 'landing-objects-2',   page: 'Landing',   label: 'Objects · Linen, folded',              hint: 'Full bleed · any ratio' },
  { id: 'landing-motion-0',    page: 'Landing',   label: 'Motion · Rain, 24fps',                 hint: 'Full bleed · any ratio' },
  { id: 'landing-motion-1',    page: 'Landing',   label: 'Motion · Loop · 8mm',                  hint: 'Full bleed · any ratio' },
]

// Category gallery pages — placeholder slots for portfolio work
const CULINARY_SLOTS: Slot[] = Array.from({ length: 12 }, (_, i) => ({
  id: `culinary-${i}`,
  page: 'Culinary',
  label: `Culinary · Frame ${i + 1}`,
  hint: 'Gallery · landscape or portrait',
}))

const SPACES_SLOTS: Slot[] = Array.from({ length: 10 }, (_, i) => ({
  id: `spaces-${i}`,
  page: 'Spaces',
  label: `Spaces · Frame ${i + 1}`,
  hint: 'Gallery · landscape or portrait',
}))

const PORTRAITS_SLOTS: Slot[] = Array.from({ length: 12 }, (_, i) => ({
  id: `portraits-${i}`,
  page: 'Portraits',
  label: `Portraits · Frame ${i + 1}`,
  hint: 'Gallery · portrait preferred',
}))

const OBJECTS_SLOTS: Slot[] = Array.from({ length: 10 }, (_, i) => ({
  id: `objects-${i}`,
  page: 'Objects',
  label: `Objects · Frame ${i + 1}`,
  hint: 'Gallery · square or portrait',
}))

const MOTION_SLOTS: Slot[] = Array.from({ length: 6 }, (_, i) => ({
  id: `motion-${i}`,
  page: 'Motion',
  label: `Motion · Frame ${i + 1}`,
  hint: 'Gallery · video still or landscape',
}))

const INFO_SLOTS: Slot[] = [
  { id: 'info-portrait', page: 'Info', label: 'Info · Portrait photo (4:5)', hint: '4:5 portrait · 800×1000px min' },
]

export const ALL_SLOTS: Slot[] = [
  ...LANDING_SLOTS,
  ...CULINARY_SLOTS,
  ...SPACES_SLOTS,
  ...PORTRAITS_SLOTS,
  ...OBJECTS_SLOTS,
  ...MOTION_SLOTS,
  ...INFO_SLOTS,
]

export const PAGES = ['Landing', 'Culinary', 'Spaces', 'Portraits', 'Objects', 'Motion', 'Info']
