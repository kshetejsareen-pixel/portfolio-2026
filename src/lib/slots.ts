import { categories } from '@/lib/categories'

export interface Slot {
  id: string
  page: string
  label: string
  hint: string
}

// Frame label: use categories.ts metadata if it exists, else fall back to a number
function landingSlotLabel(catId: string, index: number): string {
  const cat = categories.find((c) => c.id === catId)
  const frame = cat?.frames[index]
  const catLabel = cat?.label ?? catId
  return frame ? `${catLabel} · ${frame.title}` : `${catLabel} · Frame ${index + 1}`
}

// Generate landing slots dynamically for a given config
export function getLandingSlots(config: Record<string, number>): Slot[] {
  const CAT_IDS = ['culinary', 'spaces', 'portraits', 'objects', 'motion']
  return CAT_IDS.flatMap((catId) => {
    const count = config[catId] ?? 0
    return Array.from({ length: count }, (_, i) => ({
      id: `landing-${catId}-${i}`,
      page: 'Landing',
      label: landingSlotLabel(catId, i),
      hint: 'Full bleed · any ratio',
    }))
  })
}

// Category gallery pages
// Each category has exactly 17 image slots matching the editorial flow:
// 1 full-bleed + 3 asym + 3 three-up + 3 three-up + 1 full-bleed-pano +
// 2 diptych + 2 duo + 1 offset + 1 full-bleed = 17

const CULINARY_SLOTS: Slot[] = Array.from({ length: 17 }, (_, i) => ({
  id: `culinary-${i}`,
  page: 'Culinary',
  label: `Culinary · Frame ${i + 1}`,
  hint: 'Gallery · landscape or portrait',
}))

const SPACES_SLOTS: Slot[] = Array.from({ length: 17 }, (_, i) => ({
  id: `spaces-${i}`,
  page: 'Spaces',
  label: `Spaces · Frame ${i + 1}`,
  hint: 'Gallery · landscape or portrait',
}))

const PORTRAITS_SLOTS: Slot[] = Array.from({ length: 17 }, (_, i) => ({
  id: `portraits-${i}`,
  page: 'Portraits',
  label: `Portraits · Frame ${i + 1}`,
  hint: 'Gallery · portrait preferred',
}))

const OBJECTS_SLOTS: Slot[] = Array.from({ length: 17 }, (_, i) => ({
  id: `objects-${i}`,
  page: 'Objects',
  label: `Objects · Frame ${i + 1}`,
  hint: 'Gallery · square or portrait',
}))

const MOTION_SLOTS: Slot[] = Array.from({ length: 17 }, (_, i) => ({
  id: `motion-${i}`,
  page: 'Motion',
  label: `Motion · Frame ${i + 1}`,
  hint: 'Gallery · video still or landscape',
}))

const INFO_SLOTS: Slot[] = [
  { id: 'info-portrait', page: 'Info', label: 'Info · Portrait photo (4:5)', hint: '4:5 portrait · 800×1000px min' },
]

const HERO_SLOTS: Slot[] = [
  { id: 'culinary-hero',  page: 'Culinary',  label: 'Culinary · Hero banner',  hint: 'Full-bleed banner behind the category title' },
  { id: 'spaces-hero',    page: 'Spaces',    label: 'Spaces · Hero banner',    hint: 'Full-bleed banner behind the category title' },
  { id: 'portraits-hero', page: 'Portraits', label: 'Portraits · Hero banner', hint: 'Full-bleed banner behind the category title' },
  { id: 'objects-hero',   page: 'Objects',   label: 'Objects · Hero banner',   hint: 'Full-bleed banner behind the category title' },
  { id: 'motion-hero',    page: 'Motion',    label: 'Motion · Hero banner',    hint: 'Full-bleed banner behind the category title' },
]

// Static non-landing slots (used for gallery pages etc.)
export const GALLERY_SLOTS: Slot[] = [
  ...HERO_SLOTS,
  ...CULINARY_SLOTS,
  ...SPACES_SLOTS,
  ...PORTRAITS_SLOTS,
  ...OBJECTS_SLOTS,
  ...MOTION_SLOTS,
  ...INFO_SLOTS,
]

export const PAGES = ['Landing', 'Culinary', 'Spaces', 'Portraits', 'Objects', 'Motion', 'Info']
