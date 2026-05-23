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

// Static non-landing slots (used for gallery pages etc.)
export const GALLERY_SLOTS: Slot[] = [
  ...CULINARY_SLOTS,
  ...SPACES_SLOTS,
  ...PORTRAITS_SLOTS,
  ...OBJECTS_SLOTS,
  ...MOTION_SLOTS,
  ...INFO_SLOTS,
]

export const PAGES = ['Landing', 'Culinary', 'Spaces', 'Portraits', 'Objects', 'Motion', 'Info']
